"""
Model Registry — Loads and manages the static model catalog.

Provides typed access to model metadata including capabilities,
pricing, free/paid status, and provider information.
"""

import json
import os
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class ModelCapabilities:
    """Capabilities of an AI model."""
    vision: bool = False
    reasoning: bool = False
    streaming: bool = True
    tool_calling: bool = False
    json_mode: bool = False


@dataclass
class ModelEntry:
    """A single model in the registry."""
    id: str
    provider: str  # 'google', 'openrouter'
    display_name: str
    is_free: bool
    context_window: int
    max_output_tokens: int
    capabilities: ModelCapabilities
    category: str  # 'general', 'coding', 'reasoning', 'creative'
    speed: str  # 'very_fast', 'fast', 'medium', 'slow'
    quality: str  # 'good', 'high', 'very_high'
    input_price_per_million: float = 0.0
    output_price_per_million: float = 0.0


class ModelRegistry:
    """
    Centralized registry of all available AI models.

    Loads from model_registry.json and provides query methods
    for filtering by provider, free/paid status, and capabilities.
    """

    def __init__(self):
        self._models: dict[str, ModelEntry] = {}
        self._load_registry()

    def _load_registry(self):
        """Load models from the JSON catalog file."""
        registry_path = os.path.join(
            os.path.dirname(__file__), "model_registry.json"
        )
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                data = json.load(f)

            for entry in data.get("models", []):
                caps = entry.get("capabilities", {})
                model = ModelEntry(
                    id=entry["id"],
                    provider=entry["provider"],
                    display_name=entry["display_name"],
                    is_free=entry.get("is_free", False),
                    context_window=entry.get("context_window", 4096),
                    max_output_tokens=entry.get("max_output_tokens", 4096),
                    capabilities=ModelCapabilities(
                        vision=caps.get("vision", False),
                        reasoning=caps.get("reasoning", False),
                        streaming=caps.get("streaming", True),
                        tool_calling=caps.get("tool_calling", False),
                        json_mode=caps.get("json_mode", False),
                    ),
                    category=entry.get("category", "general"),
                    speed=entry.get("speed", "medium"),
                    quality=entry.get("quality", "good"),
                    input_price_per_million=entry.get("input_price_per_million", 0.0),
                    output_price_per_million=entry.get("output_price_per_million", 0.0),
                )
                self._models[model.id] = model

            print(f"[ModelRegistry] Loaded {len(self._models)} models from registry")
        except FileNotFoundError:
            print("[ModelRegistry] WARNING: model_registry.json not found — registry empty")
        except json.JSONDecodeError as e:
            print(f"[ModelRegistry] ERROR: Invalid JSON in model_registry.json: {e}")

    def get_model(self, model_id: str) -> Optional[ModelEntry]:
        """Get a specific model by ID."""
        return self._models.get(model_id)

    def list_models(
        self,
        provider: Optional[str] = None,
        free_only: Optional[bool] = None,
        category: Optional[str] = None,
    ) -> list[ModelEntry]:
        """List models with optional filters."""
        results = list(self._models.values())

        if provider is not None:
            results = [m for m in results if m.provider == provider]
        if free_only is not None:
            results = [m for m in results if m.is_free == free_only]
        if category is not None:
            results = [m for m in results if m.category == category]

        return results

    def get_free_models(self) -> list[ModelEntry]:
        """Get all free models."""
        return self.list_models(free_only=True)

    def get_paid_models(self) -> list[ModelEntry]:
        """Get all paid models."""
        return self.list_models(free_only=False)

    def to_dict_list(self) -> list[dict]:
        """Serialize all models to a list of dicts (for API responses)."""
        result = []
        for m in self._models.values():
            result.append({
                "id": m.id,
                "provider": m.provider,
                "display_name": m.display_name,
                "is_free": m.is_free,
                "context_window": m.context_window,
                "max_output_tokens": m.max_output_tokens,
                "capabilities": {
                    "vision": m.capabilities.vision,
                    "reasoning": m.capabilities.reasoning,
                    "streaming": m.capabilities.streaming,
                    "tool_calling": m.capabilities.tool_calling,
                    "json_mode": m.capabilities.json_mode,
                },
                "category": m.category,
                "speed": m.speed,
                "quality": m.quality,
                "input_price_per_million": m.input_price_per_million,
                "output_price_per_million": m.output_price_per_million,
            })
        return result


# Singleton instance — loaded once at import time
registry = ModelRegistry()
