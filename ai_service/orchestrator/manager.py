"""
AI Manager — Unified entry point for all AI generation requests.

Replaces direct OpenRouterWrapper/GoogleGenAIWrapper usage.
Routes through the provider abstraction and handles failover.
"""

import os
from typing import Optional

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
        cache_key = f"{provider_type}:{api_key[:8]}"

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

    def generate(self, prompt: str, safety_settings=None, max_retries: int = 3) -> ProviderResponse:
        """
        Generate content with intelligent routing and failover.

        Flow:
        1. Resolve the target model (explicit or auto-select)
        2. Determine the provider from the API key
        3. Execute the request
        4. On failure: mark model as failed, try fallbacks
        5. Never silently switch to a paid model

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

        import time
        from .health import health_monitor
        
        # Resolve which model to use
        model = resolve_model(
            model_id=self._model_id,
            provider=provider_type,
            routing_pref=self._routing_pref
        )

        # Attempt generation with the primary model
        start_time = time.time()
        try:
            response = provider.generate(prompt, model.id, safety_settings)
            latency = time.time() - start_time
            health_monitor.record_success(model.id, latency)
            return response
        except ProviderError as e:
            print(f"[AIManager] Primary model {model.id} failed: {e}")
            mark_model_failed(model.id, e)

            # Only attempt failover for free models
            if not model.is_free:
                raise ValueError(f"Paid model {model.display_name} failed: {e}")

        # Failover: try other compatible free models
        fallbacks = get_fallback_models(model.id, provider=provider_type)
        
        for i, fallback in enumerate(fallbacks[:max_retries]):
            start_time = time.time()
            try:
                print(f"[AIManager] Failover attempt {i + 1}: trying {fallback.display_name}")
                response = provider.generate(prompt, fallback.id, safety_settings)
                latency = time.time() - start_time
                health_monitor.record_success(fallback.id, latency)
                print(f"[AIManager] Failover success with {fallback.display_name}")
                return response
            except ProviderError as e:
                print(f"[AIManager] Failover {fallback.display_name} also failed: {e}")
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
