"""
Google Gemini Provider — Wraps the Google GenAI SDK.

Supports Gemini 2.5 Flash (free), Gemini 2.5 Pro (paid),
and Gemini 1.5 Flash (free).

RESILIENCE DESIGN:
- Classifies 404 NOT_FOUND errors as rate-limit-like to trigger failover
  (Google frequently deprecates model IDs without warning).
- Detects "no longer available" errors from Google and treats them as model unavailable.
"""

from .base import BaseProvider, ProviderResponse, ProviderHealth, ProviderError

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class GeminiProvider(BaseProvider):
    """Google Gemini AI provider (via google-genai SDK)."""

    def __init__(self, api_key: str):
        if not GEMINI_AVAILABLE:
            raise ImportError("google-genai package is required for Gemini provider")
        self._api_key = api_key
        self._client = genai.Client(api_key=api_key)

    @property
    def provider_name(self) -> str:
        return "google"

    def _resolve_model_name(self, model_id: str) -> str:
        """
        Convert registry model ID to the format expected by Google's API.
        e.g., 'google/gemini-2.5-flash' → 'gemini-2.5-flash'
        """
        if model_id.startswith("google/"):
            return model_id[len("google/"):]
        return model_id

    def generate(self, prompt: str, model_id: str, safety_settings=None) -> ProviderResponse:
        """Generate content through Google Gemini."""
        resolved_model = self._resolve_model_name(model_id)

        try:
            config = None
            if safety_settings:
                converted_settings = []
                for s in safety_settings:
                    converted_settings.append(
                        types.SafetySetting(
                            category=s.get("category"),
                            threshold=s.get("threshold"),
                        )
                    )
                config = types.GenerateContentConfig(safety_settings=converted_settings)

            response = self._client.models.generate_content(
                model=resolved_model,
                contents=prompt,
                config=config,
            )

            text = response.text or ""
            usage = {}
            if hasattr(response, "usage_metadata") and response.usage_metadata:
                usage = {
                    "prompt_tokens": getattr(response.usage_metadata, "prompt_token_count", 0),
                    "completion_tokens": getattr(response.usage_metadata, "candidates_token_count", 0),
                }

            return ProviderResponse(
                text=text,
                model_id=model_id,
                provider=self.provider_name,
                usage=usage,
            )
        except Exception as e:
            msg = str(e)
            is_rate = "429" in msg or "rate" in msg.lower() or "resource_exhausted" in msg.lower()
            is_quota = "quota" in msg.lower() or "exceeded" in msg.lower()
            
            # Google frequently deprecates models — treat 404/NOT_FOUND as rate-limit
            # so the router fails over to the next model instead of crashing
            is_not_found = "404" in msg or "not_found" in msg.lower() or "no longer available" in msg.lower()
            if is_not_found:
                is_rate = True  # Trigger failover
            
            raise ProviderError(
                message=msg[:500],
                provider=self.provider_name,
                model_id=model_id,
                is_rate_limit=is_rate,
                is_quota=is_quota,
            )

    def list_available_models(self) -> list[str]:
        """Return model IDs that Google Gemini can serve."""
        return [
            "google/gemini-2.5-flash",
            "google/gemini-2.5-pro",
            "google/gemini-1.5-flash",
        ]

    def health_check(self) -> ProviderHealth:
        """Check Gemini availability."""
        try:
            # Quick probe — list models
            models = self._client.models.list()
            return ProviderHealth(
                provider=self.provider_name,
                is_healthy=True,
                available_models=len(self.list_available_models()),
            )
        except Exception as e:
            return ProviderHealth(
                provider=self.provider_name,
                is_healthy=False,
                error=str(e)[:200],
                available_models=0,
            )
