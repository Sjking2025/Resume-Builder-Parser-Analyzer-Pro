"""
AI Manager — Unified entry point for all AI generation requests.

Replaces direct OpenRouterWrapper/GoogleGenAIWrapper usage.
Routes through the provider abstraction and handles failover.

RESILIENCE DESIGN:
- Retries transient errors (503, timeout) once with a short delay.
- Strips provider-incompatible safety settings automatically.
- Exhausts ALL free fallbacks before raising PAID_CONSENT_REQUIRED.
- Logs every attempt clearly for debugging.
"""

import os
import time
import hashlib
from typing import Optional
from concurrent.futures import ThreadPoolExecutor, TimeoutError as FuturesTimeoutError

# Hard timeout for any single generation attempt
_GENERATION_TIMEOUT_S = 120

from .models import registry
from .router import resolve_model, get_fallback_models, mark_model_failed
from .providers.base import ProviderResponse, ProviderError, ProviderHealth

# Lazy-loaded provider instances (per API key)
_provider_cache: dict[str, object] = {}


class AIManager:
    """
    Unified AI Manager — the single entry point for all AI generation.

    Usage:
        manager = AIManager(api_key="sk-or-...", model_id="deepseek/deepseek-r1:free")
        response = manager.generate("Analyze this resume...")
        print(response.text)
    """

    def __init__(self, api_key: str = None, model_id: str = None, routing_pref: str = "free_first"):
        """
        Initialize the AI Manager.

        Args:
            api_key: User-provided API key, or falls back to env vars.
            model_id: Explicit model ID, 'auto', or None (auto-select).
            routing_pref: User preference for auto-routing (free_first, fastest, highest_quality).
        """
        self._api_key = api_key
        self._model_id = model_id
        self._routing_pref = routing_pref
        self._resolved_model = None
        self._provider = None

    def _get_active_key_and_provider_type(self) -> tuple[str, str]:
        """Determine the active API key and which provider type to use."""
        key = self._api_key

        if not key:
            # Fall back to environment variables
            key = os.getenv("GOOGLE_API_KEY") or os.getenv("OPENROUTER_API_KEY")

        if not key:
            raise ValueError("No API key available. Set GOOGLE_API_KEY or OPENROUTER_API_KEY.")

        # Detect provider from key format
        if key.startswith("sk-or-"):
            return key, "openrouter"
        else:
            return key, "google"

    def _get_provider(self, provider_type: str, api_key: str):
        """Get or create a provider instance (cached per key+type)."""
        cache_key = f"{provider_type}:{hashlib.sha256(api_key.encode()).hexdigest()[:16]}"

        if cache_key not in _provider_cache:
            if provider_type == "google":
                from .providers.gemini_provider import GeminiProvider
                _provider_cache[cache_key] = GeminiProvider(api_key)
            elif provider_type == "openrouter":
                from .providers.openrouter_provider import OpenRouterProvider
                _provider_cache[cache_key] = OpenRouterProvider(api_key)
            else:
                raise ValueError(f"Unknown provider type: {provider_type}")

        return _provider_cache[cache_key]

    def _sanitize_safety_settings(self, safety_settings, provider_type: str):
        """
        Strip safety_settings that are incompatible with the provider.
        Gemini uses HARM_CATEGORY_*, OpenRouter ignores them entirely.
        """
        if provider_type == "openrouter":
            return None  # OpenRouter doesn't support Gemini-style safety settings
        return safety_settings

    def _try_generate(self, provider, model_id: str, prompt: str, safety_settings=None) -> ProviderResponse:
        """
        Attempt generation with a single retry for transient errors (503, timeout, connection).
        Enforces a hard timeout of _GENERATION_TIMEOUT_S per attempt.
        """
        last_error = None
        for attempt in range(2):  # 1 initial + 1 retry
            try:
                # Enforce hard timeout so no request hangs indefinitely
                with ThreadPoolExecutor(max_workers=1) as executor:
                    future = executor.submit(provider.generate, prompt, model_id, safety_settings)
                    return future.result(timeout=_GENERATION_TIMEOUT_S)
            except FuturesTimeoutError:
                raise ProviderError(
                    message=f"Generation timed out after {_GENERATION_TIMEOUT_S}s",
                    provider=provider.provider_name,
                    model_id=model_id,
                    is_rate_limit=True,  # Treat as rate-limit-like to trigger failover
                )
            except ProviderError as e:
                last_error = e
                # Only retry on transient errors (not rate limits or auth errors)
                is_transient = (
                    "503" in str(e) or 
                    "502" in str(e) or
                    "timeout" in str(e).lower() or 
                    "connection" in str(e).lower() or
                    "temporarily" in str(e).lower()
                )
                if attempt == 0 and is_transient:
                    print(f"[AIManager] Transient error on {model_id}, retrying in 2s...")
                    time.sleep(2)
                    continue
                raise
        raise last_error

    def generate(self, prompt: str, safety_settings=None, max_retries: int = 5) -> ProviderResponse:
        """
        Generate content with intelligent routing and failover.

        Flow:
        1. Resolve the target model (explicit or auto-select)
        2. Determine the provider from the API key
        3. Sanitize safety settings for the provider
        4. Execute the request with transient-error retry
        5. On failure: mark model as failed, try fallbacks
        6. Never silently switch to a paid model

        Args:
            prompt: The prompt to send.
            safety_settings: Optional safety configuration.
            max_retries: Maximum number of fallback attempts.

        Returns:
            ProviderResponse with the generated text.

        Raises:
            ValueError if all models fail.
        """
        api_key, provider_type = self._get_active_key_and_provider_type()
        provider = self._get_provider(provider_type, api_key)

        from .health import health_monitor
        
        # Sanitize safety settings for the active provider
        safe_settings = self._sanitize_safety_settings(safety_settings, provider_type)
        
        # Resolve which model to use
        model = resolve_model(
            model_id=self._model_id,
            provider=provider_type,
            routing_pref=self._routing_pref
        )

        # Attempt generation with the primary model
        start_time = time.time()
        try:
            print(f"[AIManager] Trying primary: {model.display_name} ({model.id})")
            response = self._try_generate(provider, model.id, prompt, safe_settings)
            latency = time.time() - start_time
            health_monitor.record_success(model.id, latency)
            print(f"[AIManager] OK -- {model.display_name} ({latency:.1f}s)")
            return response
        except ProviderError as e:
            print(f"[AIManager] FAIL -- Primary {model.display_name}: {e}")
            mark_model_failed(model.id, e)

            # Only attempt failover for free models
            if not model.is_free:
                raise ValueError(f"Paid model {model.display_name} failed: {e}")

        # Failover: try other compatible free models
        fallbacks = get_fallback_models(model.id, provider=provider_type)
        
        for i, fallback in enumerate(fallbacks[:max_retries]):
            start_time = time.time()
            try:
                print(f"[AIManager] Failover {i + 1}/{min(len(fallbacks), max_retries)}: {fallback.display_name} ({fallback.id})")
                response = self._try_generate(provider, fallback.id, prompt, safe_settings)
                latency = time.time() - start_time
                health_monitor.record_success(fallback.id, latency)
                print(f"[AIManager] OK -- Failover {fallback.display_name} ({latency:.1f}s)")
                return response
            except ProviderError as e:
                print(f"[AIManager] FAIL -- Failover {fallback.display_name}: {e}")
                mark_model_failed(fallback.id, e)
                continue

        # If we exhausted all free fallbacks and didn't start with a paid model
        # We need to signal the frontend to ask for paid model consent
        raise ValueError(
            "PAID_CONSENT_REQUIRED: All compatible free models are currently exhausted or rate-limited."
        )

    def generate_content(self, prompt: str, safety_settings=None):
        """
        Backward-compatible wrapper matching the old OpenRouterWrapper/GoogleGenAIWrapper interface.

        Returns an object with a .text attribute.
        """
        response = self.generate(prompt, safety_settings)

        class LegacyResponse:
            def __init__(self, text):
                self.text = text

        return LegacyResponse(response.text)

    def run_preflight_checks(self, required_capability: str = None) -> dict:
        """
        Run comprehensive preflight checks before generation.
        Returns a dict of status checks.
        """
        try:
            api_key, provider_type = self._get_active_key_and_provider_type()
        except ValueError as e:
            return {
                "is_ready": False,
                "provider_healthy": False,
                "authentication_valid": False,
                "error": str(e)
            }
            
        provider = self._get_provider(provider_type, api_key)
        
        from .router import resolve_model, get_fallback_models
        try:
            model = resolve_model(
                model_id=self._model_id,
                provider=provider_type,
                routing_pref=self._routing_pref
            )
        except ValueError as e:
            return {
                "is_ready": False,
                "provider_healthy": True,
                "model_available": False,
                "error": str(e)
            }
        
        health = provider.health_check()
        
        capability_ok = True
        if required_capability:
            capability_ok = getattr(model.capabilities, required_capability, False)
            
        from .health import health_monitor
        on_cooldown = health_monitor.is_on_cooldown(model.id)
        rate_limit_ok = not on_cooldown
        
        # Determine overall readiness
        is_ready = health.is_healthy and capability_ok
        
        if not rate_limit_ok:
            fallbacks = get_fallback_models(model.id, provider=provider_type)
            if not fallbacks:
                is_ready = False
            else:
                is_ready = health.is_healthy  # Still healthy, just using fallback
                
        return {
            "is_ready": is_ready,
            "provider_healthy": health.is_healthy,
            "model_available": True,
            "capabilities_supported": capability_ok,
            "rate_limit_ok": rate_limit_ok,
            "authentication_valid": health.error is None or ("401" not in str(health.error) and "unauthorized" not in str(health.error).lower()),
            "resolved_model": model.display_name,
            "error": health.error
        }

    @staticmethod
    def get_model_catalog() -> list[dict]:
        """Return the full model catalog for API responses."""
        return registry.to_dict_list()

    @staticmethod
    def get_provider_health(api_key: str = None) -> list[dict]:
        """Check health of available providers."""
        results = []
        key = api_key or os.getenv("GOOGLE_API_KEY") or os.getenv("OPENROUTER_API_KEY")
        
        if not key:
            return [{"provider": "none", "is_healthy": False, "error": "No API key configured"}]

        if key.startswith("sk-or-"):
            try:
                from .providers.openrouter_provider import OpenRouterProvider
                provider = OpenRouterProvider(key)
                health = provider.health_check()
                results.append({
                    "provider": health.provider,
                    "is_healthy": health.is_healthy,
                    "error": health.error,
                    "available_models": health.available_models,
                })
            except Exception as e:
                results.append({"provider": "openrouter", "is_healthy": False, "error": str(e)[:200]})
        else:
            try:
                from .providers.gemini_provider import GeminiProvider
                provider = GeminiProvider(key)
                health = provider.health_check()
                results.append({
                    "provider": health.provider,
                    "is_healthy": health.is_healthy,
                    "error": health.error,
                    "available_models": health.available_models,
                })
            except Exception as e:
                results.append({"provider": "google", "is_healthy": False, "error": str(e)[:200]})

        return results
