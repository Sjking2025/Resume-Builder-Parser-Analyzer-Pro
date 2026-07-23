"""
Base Provider Interface — Abstract contract for all AI providers.

Every provider plugin must implement this interface to be compatible
with the orchestrator's routing engine.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Optional
import re as _re


@dataclass
class ProviderResponse:
    """Standardized response from any provider."""
    text: str
    model_id: str
    provider: str
    usage: dict = field(default_factory=dict)  # { prompt_tokens, completion_tokens }


@dataclass
class ProviderHealth:
    """Health status of a provider."""
    provider: str
    is_healthy: bool
    latency_ms: Optional[float] = None
    error: Optional[str] = None
    available_models: int = 0


class ProviderError(Exception):
    """Base error for provider failures."""

    def __init__(self, message: str, provider: str, model_id: str, is_rate_limit: bool = False, is_quota: bool = False):
        self.provider = provider
        self.model_id = model_id
        self.is_rate_limit = is_rate_limit
        self.is_quota = is_quota
        # Redact API keys from message
        safe_msg = _re.sub(r'sk-or-[\w-]+', 'sk-or-***REDACTED***', str(message))
        safe_msg = _re.sub(r'AIza[\w-]+', 'AIza***REDACTED***', safe_msg)
        super().__init__(safe_msg)


class BaseProvider(ABC):
    """
    Abstract base class for all AI provider plugins.

    Implementations must define:
    - generate(): Execute a prompt and return a ProviderResponse
    - list_available_models(): Return model IDs this provider can serve
    - health_check(): Return current health status
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Unique identifier for this provider (e.g., 'google', 'openrouter')."""
        ...

    @abstractmethod
    def generate(self, prompt: str, model_id: str, safety_settings=None) -> ProviderResponse:
        """
        Generate content from a prompt using the specified model.

        Args:
            prompt: The user prompt to send.
            model_id: The specific model to use.
            safety_settings: Optional safety configuration.

        Returns:
            ProviderResponse with the generated text.

        Raises:
            ProviderError on failure (with rate_limit/quota flags set).
        """
        ...

    @abstractmethod
    def list_available_models(self) -> list[str]:
        """Return a list of model IDs this provider can serve."""
        ...

    @abstractmethod
    def health_check(self) -> ProviderHealth:
        """Check if the provider is reachable and healthy."""
        ...
