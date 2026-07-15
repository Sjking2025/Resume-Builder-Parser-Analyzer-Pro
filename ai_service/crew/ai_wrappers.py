"""AI model wrappers for OpenRouter and Google Gemini"""

import os
import re as _re

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


def _redact_key(message: str) -> str:
    """Redact API keys from error messages to prevent leaks in logs."""
    msg = str(message)
    msg = _re.sub(r'sk-or-[\w-]+', 'sk-or-***REDACTED***', msg)
    msg = _re.sub(r'AIza[\w-]+', 'AIza***REDACTED***', msg)
    return msg


class OpenRouterWrapper:
    def __init__(self, api_key: str, model_name: str = "openrouter/free"):
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
        )
        self.model_name = model_name

    def generate_content(self, prompt: str, safety_settings=None):
        try:
            completion = self.client.chat.completions.create(
                model=self.model_name,
                messages=[{"role": "user", "content": prompt}],
            )

            class Response:
                def __init__(self, text):
                    self.text = text

            return Response(completion.choices[0].message.content)
        except Exception as e:
            safe_msg = _redact_key(str(e))
            if "quota" in safe_msg.lower() or "429" in str(e):
                raise ValueError("OpenRouter API Quota Exceeded. Please try again later.")
            raise ValueError(safe_msg)


class GoogleGenAIWrapper:
    def __init__(self, api_key: str, model_name: str = "gemini-2.5-flash"):
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name

    def generate_content(self, prompt: str, safety_settings=None):
        try:
            config = None
            if safety_settings:
                converted_settings = []
                for s in safety_settings:
                    converted_settings.append(
                        types.SafetySetting(
                            category=s.get("category"),
                            threshold=s.get("threshold")
                        )
                    )
                config = types.GenerateContentConfig(safety_settings=converted_settings)

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config
            )
            return response
        except Exception as e:
            safe_msg = _redact_key(str(e))
            print(f"[ERROR] [GoogleGenAI] Generation failed: {safe_msg}")
            raise ValueError(safe_msg)
