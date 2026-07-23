"""
OpenRouter Provider — Wraps the OpenAI-compatible OpenRouter API.

Supports all models accessible through OpenRouter including free-tier
models like DeepSeek R1, Llama 4 Scout, Gemma 3, etc.
"""

from .base import BaseProvider, ProviderResponse, ProviderHealth, ProviderError

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class OpenRouterProvider(BaseProvider):
    """OpenRouter AI provider (OpenAI-compatible API)."""

    def __init__(self, api_key: str):
        if not OPENAI_AVAILABLE:
            raise ImportError("openai package is required for OpenRouter provider")
        self._api_key = api_key
        self._client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )

    @property
    def provider_name(self) -> str:
        return "openrouter"

    def generate(self, prompt: str, model_id: str, safety_settings=None) -> ProviderResponse:
        """Generate content through OpenRouter."""
        try:
            completion = self._client.chat.completions.create(
                model=model_id,
                messages=[{"role": "user", "content": prompt}],
            )

            text = completion.choices[0].message.content or ""
            usage = {}
            if completion.usage:
                usage = {
                    "prompt_tokens": completion.usage.prompt_tokens,
                    "completion_tokens": completion.usage.completion_tokens,
                }

            return ProviderResponse(
                text=text,
                model_id=model_id,
                provider=self.provider_name,
                usage=usage,
            )
        except Exception as e:
            msg = str(e)
            is_rate = "429" in msg or "rate" in msg.lower()
            is_quota = "quota" in msg.lower() or "exceeded" in msg.lower()
            raise ProviderError(
                message=msg,
                provider=self.provider_name,
                model_id=model_id,
                is_rate_limit=is_rate,
                is_quota=is_quota,
            )

    def list_available_models(self) -> list[str]:
        """Return model IDs that OpenRouter can serve."""
        return [
            "deepseek/deepseek-r1:free",
            "deepseek/deepseek-chat-v3-0324:free",
            "google/gemma-3-27b-it:free",
            "meta-llama/llama-4-scout:free",
            "meta-llama/llama-4-maverick:free",
            "qwen/qwen3-235b-a22b:free",
            "mistralai/mistral-small-3.2-24b-instruct:free",
            "openrouter/auto",
            "openai/gpt-4o",
            "openai/gpt-4o-mini",
            "anthropic/claude-sonnet-4",
            "anthropic/claude-3.5-haiku",
        ]

    def health_check(self) -> ProviderHealth:
        """Check OpenRouter availability."""
        try:
            # Simple test — list models endpoint
            self._client.models.list()
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
