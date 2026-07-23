"""
Routing Engine — Intelligent model selection with free-first strategy.

Resolves the best model for a given request, handles failover
between compatible free models, and enforces the paid consent barrier.
"""

import time
from typing import Optional
from .models import registry, ModelEntry
from .providers.base import ProviderError


from .health import health_monitor

def _is_on_cooldown(model_id: str) -> bool:
    """Check if a model is currently on cooldown via HealthMonitor."""
    return health_monitor.is_on_cooldown(model_id)


def resolve_model(
    model_id: Optional[str] = None,
    provider: Optional[str] = None,
    task_type: str = "general",
    routing_pref: str = "free_first",
) -> ModelEntry:
    """
    Resolve the best model for a request.

    Priority:
    1. If model_id is explicitly specified and exists → use it
    2. If model_id is 'auto' or None → select best free model
    3. Skip models on cooldown

    Args:
        model_id: Explicit model ID, 'auto', or None
        provider: Optional provider filter
        task_type: 'general', 'coding', 'reasoning', 'creative'

    Returns:
        ModelEntry for the resolved model

    Raises:
        ValueError if no suitable model can be found
    """
    # 1. Explicit model request
    if model_id and model_id != "auto":
        model = registry.get_model(model_id)
        if model:
            return model
        # Model not in registry — could be a direct model ID the user typed
        # Return a synthetic entry so the provider can attempt it
        print(f"[Router] Model {model_id} not in registry, passing through to provider")
        from .models import ModelCapabilities
        return ModelEntry(
            id=model_id,
            provider=provider or _guess_provider(model_id),
            display_name=model_id,
            is_free=":free" in model_id,
            context_window=128000,
            max_output_tokens=32000,
            capabilities=ModelCapabilities(),
            category="general",
            speed="medium",
            quality="good",
        )

    # 2. Auto-select: best free model not on cooldown
    free_models = registry.get_free_models()

    # Filter by provider if specified
    if provider:
        free_models = [m for m in free_models if m.provider == provider]

    # Filter by category preference
    if task_type != "general":
        category_matches = [m for m in free_models if m.category == task_type]
        if category_matches:
            free_models = category_matches + [m for m in free_models if m not in category_matches]

    # Remove cooldown models
    available = [m for m in free_models if not _is_on_cooldown(m.id)]

    if available:
        if routing_pref == "fastest":
            speed_order = {"very_fast": 0, "fast": 1, "medium": 2, "slow": 3}
            available.sort(key=lambda m: speed_order.get(m.speed, 4))
        else:
            # Default to highest quality sort (used for free_first and highest_quality)
            quality_order = {"very_high": 0, "high": 1, "good": 2}
            available.sort(key=lambda m: quality_order.get(m.quality, 3))
        return available[0]

    # All free models on cooldown — check if any are available (ignoring cooldown)
    if free_models:
        return free_models[0]  # Try anyway, the provider might have recovered

    raise ValueError("No suitable free model available")


def get_fallback_models(
    failed_model_id: str,
    provider: Optional[str] = None,
) -> list[ModelEntry]:
    """
    Get a list of fallback free models after a failure.

    Returns models ordered by quality, excluding the failed model.
    """
    free_models = registry.get_free_models()

    # Exclude the failed model
    fallbacks = [m for m in free_models if m.id != failed_model_id]

    # Remove cooldown models
    fallbacks = [m for m in fallbacks if not _is_on_cooldown(m.id)]

    # Sort by quality
    quality_order = {"very_high": 0, "high": 1, "good": 2}
    fallbacks.sort(key=lambda m: quality_order.get(m.quality, 3))

    return fallbacks


def mark_model_failed(model_id: str, error: ProviderError):
    """Mark a model as temporarily failed (rate-limited or unavailable)."""
    # Record the failure in the health monitor for exponential backoff
    health_monitor.record_failure(
        model_id, 
        is_rate_limit=error.is_rate_limit or error.is_quota,
        reason=str(error)
    )


def _guess_provider(model_id: str) -> str:
    """Guess the provider from a model ID."""
    if model_id.startswith("google/") or model_id.startswith("gemini"):
        return "google"
    return "openrouter"
