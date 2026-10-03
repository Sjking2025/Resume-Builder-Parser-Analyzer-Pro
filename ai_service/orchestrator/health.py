"""
Health Monitor for AI Models

Tracks success/failure rates, latency, and exponential backoff
cooldowns for models across the orchestrator.

RESILIENCE DESIGN:
- Short cooldowns (5s base) so free models recover quickly.
- Max cooldown capped at 60s (not minutes).
- Cooldowns are per-model, not per-provider.
- A single success resets all cooldown state for that model.
- Circuit breaker: after 5 consecutive failures, the model is
  "circuit-open" for 120s — no attempts until half-open probe.
"""

import time
from typing import Dict, List, Optional
from collections import deque


# Circuit breaker constants
CIRCUIT_FAILURE_THRESHOLD = 5      # Consecutive failures to trip the circuit
CIRCUIT_OPEN_DURATION = 120.0      # Seconds the circuit stays open before half-open probe


class ModelStats:
    """Tracks statistics for a single model."""
    def __init__(self, model_id: str):
        self.model_id = model_id
        self.success_count = 0
        self.failure_count = 0
        self.rate_limit_count = 0

        # Track last 20 latency measurements (in seconds) for percentile accuracy
        self._latencies: deque[float] = deque(maxlen=20)

        # Exponential backoff tracking
        self.cooldown_expiry: float = 0.0
        self.consecutive_failures: int = 0
        self.last_failure_reason: str = ""

        # Circuit breaker state
        self.circuit_open_until: float = 0.0

    def record_success(self, latency_s: float):
        """Record a successful generation. Resets cooldown AND circuit breaker."""
        self.success_count += 1
        self._latencies.append(latency_s)
        self.consecutive_failures = 0
        self.cooldown_expiry = 0.0
        self.circuit_open_until = 0.0
        self.last_failure_reason = ""

    def record_failure(self, is_rate_limit: bool, reason: str):
        """Record a failure and apply short, bounded exponential backoff + circuit breaker."""
        self.failure_count += 1
        self.consecutive_failures += 1
        self.last_failure_reason = reason

        if is_rate_limit:
            self.rate_limit_count += 1

        # SHORT backoff: 5s -> 10s -> 20s -> 40s -> 60s (capped)
        base_cooldown = 5
        multiplier = 2 ** min(self.consecutive_failures - 1, 4)  # Max 16x multiplier

        cooldown_duration = min(base_cooldown * multiplier, 60)  # Hard cap at 60s
        self.cooldown_expiry = time.time() + cooldown_duration

        # Circuit breaker: trip after CIRCUIT_FAILURE_THRESHOLD consecutive failures
        if self.consecutive_failures >= CIRCUIT_FAILURE_THRESHOLD and not self.is_circuit_open():
            self.circuit_open_until = time.time() + CIRCUIT_OPEN_DURATION
            print(f"[Health] CIRCUIT OPEN for {self.model_id} "
                  f"({self.consecutive_failures} consecutive failures). "
                  f"Blocked for {CIRCUIT_OPEN_DURATION}s.")
        else:
            print(f"[Health] Model {self.model_id} failed ({self.consecutive_failures}x). "
                  f"Cooldown: {cooldown_duration}s. Reason: {reason[:100]}")

    def is_on_cooldown(self) -> bool:
        """Check if the model is currently cooling down (includes circuit breaker)."""
        # Circuit breaker takes priority
        if self.is_circuit_open():
            return True

        if self.cooldown_expiry == 0.0:
            return False

        if time.time() > self.cooldown_expiry:
            # Cooldown has naturally expired
            self.cooldown_expiry = 0.0
            return False

        return True

    def is_circuit_open(self) -> bool:
        """Check if the circuit breaker is currently open (hard block)."""
        if self.circuit_open_until == 0.0:
            return False
        if time.time() > self.circuit_open_until:
            # Circuit has expired — half-open: allow one probe
            self.circuit_open_until = 0.0
            return False
        return True

    def remaining_cooldown(self) -> float:
        """Return remaining cooldown time in seconds, or 0 if not on cooldown.
        
        NOTE: Reads raw fields directly instead of calling is_circuit_open() / is_on_cooldown()
        to avoid side-effect mutations (those methods reset expiry fields when they detect expiry).
        """
        now = time.time()
        # Check circuit first (takes priority over regular cooldown)
        if self.circuit_open_until > 0.0 and now <= self.circuit_open_until:
            return self.circuit_open_until - now
        # Then regular cooldown
        if self.cooldown_expiry > 0.0 and now <= self.cooldown_expiry:
            return self.cooldown_expiry - now
        return 0.0

    @property
    def avg_latency(self) -> float:
        """Calculate average latency of recent requests."""
        if not self._latencies:
            return 0.0
        return sum(self._latencies) / len(self._latencies)

    @property
    def p50_latency(self) -> float:
        """50th percentile (median) latency."""
        if not self._latencies:
            return 0.0
        sorted_lat = sorted(self._latencies)
        idx = len(sorted_lat) // 2
        return sorted_lat[idx]

    @property
    def p95_latency(self) -> float:
        """95th percentile latency."""
        if not self._latencies:
            return 0.0
        sorted_lat = sorted(self._latencies)
        idx = min(int(len(sorted_lat) * 0.95), len(sorted_lat) - 1)
        return sorted_lat[idx]

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

    def is_circuit_open(self, model_id: str) -> bool:
        """Check if a model's circuit breaker is tripped."""
        return self._get_stats(model_id).is_circuit_open()

    def clear_cooldown(self, model_id: str):
        """Manually clear cooldown for a model (e.g., after waiting)."""
        stats = self._get_stats(model_id)
        stats.cooldown_expiry = 0.0
        stats.consecutive_failures = 0

    def clear_all_cooldowns(self):
        """Nuclear option: clear all cooldowns and circuits (e.g., on fresh request after long idle)."""
        for stats in self._stats.values():
            stats.cooldown_expiry = 0.0
            stats.circuit_open_until = 0.0
            stats.consecutive_failures = 0

    def get_stats(self, model_id: str) -> dict:
        stats = self._get_stats(model_id)
        return {
            "model_id": stats.model_id,
            "success_rate": stats.success_rate,
            "avg_latency": stats.avg_latency,
            "p50_latency": stats.p50_latency,
            "p95_latency": stats.p95_latency,
            "is_on_cooldown": stats.is_on_cooldown(),
            "is_circuit_open": stats.is_circuit_open(),
            "remaining_cooldown": stats.remaining_cooldown(),
            "consecutive_failures": stats.consecutive_failures,
            "last_failure_reason": stats.last_failure_reason
        }

# Global singleton
health_monitor = HealthMonitor()
