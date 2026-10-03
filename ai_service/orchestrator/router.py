"""
Routing Engine — Intelligent model selection with free-first strategy.

Resolves the best model for a given request, handles failover
between compatible free models, and enforces the paid consent barrier.

RESILIENCE DESIGN:
- Does NOT filter fallbacks by provider — if primary OpenRouter model fails,
  it can still try other OpenRouter models (the manager handles provider selection).
- Prioritizes models by quality, but also considers recent health.
- `openrouter/auto` is treated as a last-resort free fallback on OpenRouter.
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
            if provider and model.provider != provider:
                print(f"[Router] Explicit model {model_id} incompatible with provider {provider}, falling back to auto")
            else:
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
    # IMPORTANT: Filter by provider so we only pick models this provider can serve
    free_models = registry.get_free_models()

    if provider:
        free_models = [m for m in free_models if m.provider == provider]

    # Exclude non-text models (image, video, audio, embedding) and legacy models
    free_models = [m for m in free_models if m.category not in ("image", "video", "audio", "embedding", "legacy")]

    # Filter by category preference
    if task_type != "general":
        category_matches = [m for m in free_models if m.category == task_type]
        if category_matches:
            free_models = category_matches + [m for m in free_models if m not in category_matches]

    # Remove cooldown and circuit-open models
    available = [m for m in free_models if not _is_on_cooldown(m.id)]

    if available:
        # Use weighted composite scoring instead of pure quality sort
        available.sort(key=lambda m: _compute_model_score(m, routing_pref), reverse=True)
        return available[0]

    # All free models on cooldown — try anyway with the least-recently-failed one
    # But skip circuit-open models entirely
    recoverable = [m for m in free_models if not health_monitor.is_circuit_open(m.id)]
    if recoverable:
        recoverable.sort(key=lambda m: health_monitor._get_stats(m.id).remaining_cooldown())
        print(f"[Router] All free models on cooldown. Trying {recoverable[0].display_name} (shortest cooldown)")
        return recoverable[0]

    # Even circuit-open models — last resort
    if free_models:
        free_models.sort(key=lambda m: health_monitor._get_stats(m.id).remaining_cooldown())
        print(f"[Router] All models circuit-open or cooldown. Last resort: {free_models[0].display_name}")
        return free_models[0]

    raise ValueError("No suitable free model available")


def get_fallback_models(
    failed_model_id: str,
    provider: Optional[str] = None,
) -> list[ModelEntry]:
    """
    Get a list of fallback free models after a failure.

    Returns models ordered by quality, excluding the failed model.
    Does NOT filter by provider — the manager will handle provider routing.
    """
    free_models = registry.get_free_models()

    # Exclude the failed model
    fallbacks = [m for m in free_models if m.id != failed_model_id]

    # Filter by provider if specified
    if provider:
        fallbacks = [m for m in fallbacks if m.provider == provider]

    # Exclude non-text models
    fallbacks = [m for m in fallbacks if m.category not in ("image", "video", "audio", "embedding", "legacy")]

    # Remove cooldown and circuit-open models — but keep at least some options
    not_blocked = [m for m in fallbacks if not _is_on_cooldown(m.id)]
    if not_blocked:
        fallbacks = not_blocked
    else:
        # All on cooldown — prefer non-circuit-open, sort by shortest remaining cooldown
        recoverable = [m for m in fallbacks if not health_monitor.is_circuit_open(m.id)]
        if recoverable:
            fallbacks = recoverable
        fallbacks.sort(key=lambda m: health_monitor._get_stats(m.id).remaining_cooldown())

    # Sort by composite score (quality + health + speed)
    fallbacks.sort(key=lambda m: _compute_model_score(m, "free_first"), reverse=True)

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


def _compute_model_score(model: ModelEntry, routing_pref: str) -> float:
    """
    Compute a weighted composite score for model selection.
    Balances quality, historical health, and speed.
    Higher score = better candidate.
    """
    quality_scores = {"very_high": 1.0, "high": 0.75, "good": 0.5}
    speed_scores = {"very_fast": 1.0, "fast": 0.75, "medium": 0.5, "slow": 0.25}

    quality_val = quality_scores.get(model.quality, 0.3)
    speed_val = speed_scores.get(model.speed, 0.3)

    # Health from the monitor
    stats = health_monitor._get_stats(model.id)
    health_val = stats.success_rate  # 0.0 to 1.0

    # Adjust weights based on routing preference
    if routing_pref == "fastest":
        w_quality, w_health, w_speed = 0.2, 0.3, 0.5
    elif routing_pref == "highest_quality":
        w_quality, w_health, w_speed = 0.6, 0.3, 0.1
    else:  # free_first (default)
        w_quality, w_health, w_speed = 0.4, 0.4, 0.2

    score = (w_quality * quality_val) + (w_health * health_val) + (w_speed * speed_val)
    return score
