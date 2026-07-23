"""
Health Monitor for AI Models

Tracks success/failure rates, latency, and exponential backoff
cooldowns for models across the orchestrator.
"""

import time
from typing import Dict, List, Optional
from collections import deque


class ModelStats:
    """Tracks statistics for a single model."""
    def __init__(self, model_id: str):
        self.model_id = model_id
        self.success_count = 0
        self.failure_count = 0
        self.rate_limit_count = 0
        
        # Track last 10 latency measurements (in seconds)
        self._latencies: deque[float] = deque(maxlen=10)
        
        # Exponential backoff tracking
        self.cooldown_expiry: float = 0.0
        self.consecutive_failures: int = 0
        self.last_failure_reason: str = ""

    def record_success(self, latency_s: float):
        """Record a successful generation."""
        self.success_count += 1
        self._latencies.append(latency_s)
        self.consecutive_failures = 0
        self.cooldown_expiry = 0.0
        self.last_failure_reason = ""

    def record_failure(self, is_rate_limit: bool, reason: str):
        """Record a failure and apply exponential backoff."""
        self.failure_count += 1
        self.consecutive_failures += 1
        self.last_failure_reason = reason
        
        if is_rate_limit:
            self.rate_limit_count += 1
        
        # Exponential backoff: 30s -> 60s -> 120s -> 240s...
        base_cooldown = 30 if is_rate_limit else 10
        multiplier = 2 ** min(self.consecutive_failures - 1, 6) # Max 64x multiplier
        
        cooldown_duration = base_cooldown * multiplier
        self.cooldown_expiry = time.time() + cooldown_duration
        
        print(f"[Health] Model {self.model_id} failed ({self.consecutive_failures}x). "
              f"Cooldown applied: {cooldown_duration}s. Reason: {reason[:100]}")

    def is_on_cooldown(self) -> bool:
        """Check if the model is currently cooling down."""
        if self.cooldown_expiry == 0.0:
            return False
        
        if time.time() > self.cooldown_expiry:
            # Cooldown has naturally expired
            self.cooldown_expiry = 0.0
            return False
            
        return True

    @property
    def avg_latency(self) -> float:
        """Calculate average latency of recent requests."""
        if not self._latencies:
            return 0.0
        return sum(self._latencies) / len(self._latencies)

    @property
    def success_rate(self) -> float:
        """Calculate success rate."""
        total = self.success_count + self.failure_count
        if total == 0:
            return 1.0
        return self.success_count / total


class HealthMonitor:
    """Global health monitor for all models."""
    def __init__(self):
        self._stats: Dict[str, ModelStats] = {}

    def _get_stats(self, model_id: str) -> ModelStats:
        if model_id not in self._stats:
            self._stats[model_id] = ModelStats(model_id)
        return self._stats[model_id]

    def record_success(self, model_id: str, latency_s: float):
        self._get_stats(model_id).record_success(latency_s)

    def record_failure(self, model_id: str, is_rate_limit: bool, reason: str):
        self._get_stats(model_id).record_failure(is_rate_limit, reason)

    def is_on_cooldown(self, model_id: str) -> bool:
        return self._get_stats(model_id).is_on_cooldown()

    def get_stats(self, model_id: str) -> dict:
        stats = self._get_stats(model_id)
        return {
            "model_id": stats.model_id,
            "success_rate": stats.success_rate,
            "avg_latency": stats.avg_latency,
            "is_on_cooldown": stats.is_on_cooldown(),
            "consecutive_failures": stats.consecutive_failures,
            "last_failure_reason": stats.last_failure_reason
        }

# Global singleton
health_monitor = HealthMonitor()
