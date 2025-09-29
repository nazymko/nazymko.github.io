#!/usr/bin/env python3
"""
LLM Provider Abstraction System

This module provides a unified interface for different LLM providers including:
- Local Ollama API
- OpenAI API
- Future providers can be easily added

Each provider implements the same interface for consistent usage across scripts.
"""

import json
import requests
import time
import os
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Union
from dataclasses import dataclass

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("[WARNING] OpenAI library not installed. Run: pip install openai")


@dataclass
class LLMResponse:
    """Standardized response from any LLM provider"""
    content: str
    success: bool
    provider: str
    model: str
    processing_time: float
    token_usage: Optional[Dict[str, int]] = None
    error: Optional[str] = None
    raw_response: Optional[Dict] = None


@dataclass
class LLMRequest:
    """Standardized request for any LLM provider"""
    prompt: str
    model: str
    temperature: float = 0.7
    max_tokens: Optional[int] = None
    stream: bool = False
    system_prompt: Optional[str] = None


class LLMProvider(ABC):
    """Abstract base class for LLM providers"""

    def __init__(self, provider_name: str):
        self.provider_name = provider_name

    @abstractmethod
    def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate response from LLM"""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Check if provider is available"""
        pass

    @abstractmethod
    def list_models(self) -> List[str]:
        """List available models"""
        pass


class OllamaProvider(LLMProvider):
    """Ollama local API provider"""

    def __init__(self, base_url: str = "http://localhost:5001"):
        super().__init__("ollama")
        self.base_url = base_url.rstrip('/')
        self.timeout = 300

    def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate response using Ollama API"""
        start_time = time.time()

        try:
            # Prepare messages
            messages = []
            if request.system_prompt:
                messages.append({"role": "system", "content": request.system_prompt})
            messages.append({"role": "user", "content": request.prompt})

            # Prepare payload
            payload = {
                "model": request.model,
                "messages": messages,
                "stream": request.stream
            }

            # Add optional parameters
            if request.temperature != 0.7:
                payload["temperature"] = request.temperature
            if request.max_tokens:
                payload["max_tokens"] = request.max_tokens

            # Make request
            response = requests.post(
                f"{self.base_url}/chat",
                json=payload,
                timeout=self.timeout
            )

            processing_time = time.time() - start_time

            if response.status_code == 200:
                data = response.json()
                content = data.get('message', {}).get('content', '')

                return LLMResponse(
                    content=content,
                    success=True,
                    provider=self.provider_name,
                    model=request.model,
                    processing_time=processing_time,
                    raw_response=data
                )
            else:
                error_msg = f"HTTP {response.status_code}: {response.text}"
                return LLMResponse(
                    content="",
                    success=False,
                    provider=self.provider_name,
                    model=request.model,
                    processing_time=processing_time,
                    error=error_msg
                )

        except Exception as e:
            processing_time = time.time() - start_time
            return LLMResponse(
                content="",
                success=False,
                provider=self.provider_name,
                model=request.model,
                processing_time=processing_time,
                error=str(e)
            )

    def is_available(self) -> bool:
        """Check if Ollama service is available"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            return response.status_code == 200
        except:
            return False

    def list_models(self) -> List[str]:
        """List available Ollama models"""
        try:
            response = requests.get(f"{self.base_url}/models", timeout=10)
            if response.status_code == 200:
                data = response.json()
                models = data.get('models', [])
                return [model.get('name', '') for model in models if model.get('name')]
            return []
        except:
            return []


class OpenAIProvider(LLMProvider):
    """OpenAI API provider"""

    def __init__(self, api_key: Optional[str] = None):
        super().__init__("openai")
        if not OPENAI_AVAILABLE:
            raise ImportError("OpenAI library not installed. Run: pip install openai")

        # Try to get API key from multiple sources
        final_api_key = self._get_api_key(api_key)

        self.client = OpenAI(api_key=final_api_key) if final_api_key else OpenAI()
        self.timeout = 300

    def _get_api_key(self, provided_key: Optional[str]) -> Optional[str]:
        """Get API key from multiple sources in order of priority"""

        # 1. Use provided key if given
        if provided_key:
            print(f"[OPENAI] Using provided API key")
            return provided_key

        # 2. Try to read from open-api.key file in project root
        try:
            # Get the directory containing this script
            script_dir = os.path.dirname(os.path.abspath(__file__))
            # Go up one level to project root
            project_root = os.path.dirname(script_dir)
            key_file_path = os.path.join(project_root, "open-api.key")

            if os.path.exists(key_file_path):
                with open(key_file_path, 'r', encoding='utf-8') as f:
                    api_key = f.read().strip()
                if api_key:
                    print(f"[OPENAI] Using API key from {key_file_path}")
                    return api_key
                else:
                    print(f"[WARNING] {key_file_path} exists but is empty")
            else:
                print(f"[INFO] No API key file found at {key_file_path}")
        except Exception as e:
            print(f"[WARNING] Could not read API key from file: {e}")

        # 3. Fall back to environment variable (handled by OpenAI client)
        if os.getenv('OPENAI_API_KEY'):
            print(f"[OPENAI] Using API key from OPENAI_API_KEY environment variable")
            return None  # Let OpenAI client handle it

        print(f"[WARNING] No OpenAI API key found. Tried: --openai-api-key argument, open-api.key file, OPENAI_API_KEY environment variable")
        return None

    def generate(self, request: LLMRequest) -> LLMResponse:
        """Generate response using OpenAI API"""
        start_time = time.time()

        try:
            # Check if this is a reasoning model (gpt-5-nano, etc.)
            is_reasoning_model = request.model.startswith("gpt-5")

            if is_reasoning_model:
                # Use responses.create() for reasoning models (exact format from OpenAI example)
                # Build input array with the exact structure from the example
                input_items = []

                # Add system prompt as developer role if provided
                if request.system_prompt:
                    input_items.append({
                        "role": "developer",
                        "content": [
                            {
                                "type": "input_text",
                                "text": request.system_prompt
                            }
                        ]
                    })

                # Add user prompt
                input_items.append({
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": request.prompt
                        }
                    ]
                })

                params = {
                    "model": request.model,
                    "input": input_items,  # Use the structured input format
                    "text": {
                        "format": {"type": "text"},
                        "verbosity": "medium"
                    },
                    "reasoning": {"effort": "medium"},
                    "tools": [],
                    "store": True,
                    "include": [
                        "reasoning.encrypted_content",
                        "web_search_call.action.sources"
                    ]
                }

                response = self.client.responses.create(**params)
                processing_time = time.time() - start_time

                # Extract content from reasoning model response
                content = ""

                if hasattr(response, 'output') and response.output:
                    # Look for message type outputs
                    for output_item in response.output:
                        if hasattr(output_item, 'type') and output_item.type == 'message':
                            if hasattr(output_item, 'content') and output_item.content:
                                for content_item in output_item.content:
                                    if hasattr(content_item, 'type') and content_item.type == 'output_text':
                                        if hasattr(content_item, 'text'):
                                            content = content_item.text
                                            break
                            if content:
                                break

                # Fallback to other possible locations
                if not content:
                    if hasattr(response, 'text') and response.text:
                        content = response.text.content if hasattr(response.text, 'content') else str(response.text)
                    elif hasattr(response, 'content'):
                        content = response.content
                    elif hasattr(response, 'choices') and response.choices:
                        content = response.choices[0].message.content if hasattr(response.choices[0], 'message') else str(response.choices[0])
                    else:
                        content = str(response)

                return LLMResponse(
                    content=content,
                    success=True,
                    provider=self.provider_name,
                    model=request.model,
                    processing_time=processing_time,
                    raw_response=response.model_dump() if hasattr(response, 'model_dump') else None
                )

            else:
                # Use standard chat.completions.create() for regular models
                messages = []
                if request.system_prompt:
                    messages.append({"role": "system", "content": request.system_prompt})
                messages.append({"role": "user", "content": request.prompt})

                params = {
                    "model": request.model,
                    "messages": messages,
                    "stream": request.stream
                }

                # Add temperature only if it's not the default for models that don't support it
                if hasattr(request, 'temperature') and request.temperature is not None:
                    # Some models like gpt-4o-mini only support temperature=1
                    if request.model.startswith("gpt-4o") and request.temperature != 1.0:
                        print(f"[WARNING] Model {request.model} only supports temperature=1, skipping temperature parameter")
                    else:
                        params["temperature"] = request.temperature

                # Add optional parameters
                if request.max_tokens:
                    params["max_tokens"] = request.max_tokens

                response = self.client.chat.completions.create(**params)
                processing_time = time.time() - start_time

                if hasattr(response, 'choices') and response.choices:
                    content = response.choices[0].message.content or ""

                    # Extract token usage if available
                    token_usage = None
                    if hasattr(response, 'usage') and response.usage:
                        token_usage = {
                            "prompt_tokens": response.usage.prompt_tokens,
                            "completion_tokens": response.usage.completion_tokens,
                            "total_tokens": response.usage.total_tokens
                        }

                    return LLMResponse(
                        content=content,
                        success=True,
                        provider=self.provider_name,
                        model=request.model,
                        processing_time=processing_time,
                        token_usage=token_usage,
                        raw_response=response.model_dump() if hasattr(response, 'model_dump') else None
                    )
                else:
                    return LLMResponse(
                        content="",
                        success=False,
                        provider=self.provider_name,
                        model=request.model,
                        processing_time=processing_time,
                        error="No response content received"
                    )

        except Exception as e:
            processing_time = time.time() - start_time
            return LLMResponse(
                content="",
                success=False,
                provider=self.provider_name,
                model=request.model,
                processing_time=processing_time,
                error=str(e)
            )

    def is_available(self) -> bool:
        """Check if OpenAI API is available"""
        try:
            # Try to list models as a test
            models = self.client.models.list()
            return True
        except Exception as e:
            print(f"[DEBUG] OpenAI availability check failed: {e}")
            return False

    def list_models(self) -> List[str]:
        """List available OpenAI models"""
        try:
            response = self.client.models.list()
            return [model.id for model in response.data]
        except:
            return []


class LLMProviderManager:
    """Manager class for handling multiple LLM providers"""

    def __init__(self):
        self.providers: Dict[str, LLMProvider] = {}

    def add_provider(self, provider: LLMProvider, name: Optional[str] = None):
        """Add an LLM provider"""
        provider_name = name or provider.provider_name
        self.providers[provider_name] = provider

    def get_provider(self, name: str) -> Optional[LLMProvider]:
        """Get provider by name"""
        return self.providers.get(name)

    def list_providers(self) -> List[str]:
        """List available provider names"""
        return list(self.providers.keys())

    def get_available_providers(self) -> List[str]:
        """Get list of currently available providers"""
        available = []
        for name, provider in self.providers.items():
            if provider.is_available():
                available.append(name)
        return available

    def auto_select_provider(self, preferred_providers: Optional[List[str]] = None) -> Optional[LLMProvider]:
        """Automatically select the best available provider"""
        if preferred_providers:
            for pref in preferred_providers:
                if pref in self.providers and self.providers[pref].is_available():
                    return self.providers[pref]

        # Fallback to any available provider
        for provider in self.providers.values():
            if provider.is_available():
                return provider

        return None


def create_default_manager() -> LLMProviderManager:
    """Create manager with default providers"""
    manager = LLMProviderManager()

    # Add Ollama provider
    manager.add_provider(OllamaProvider(), "ollama")

    # Add OpenAI provider if available
    if OPENAI_AVAILABLE:
        try:
            manager.add_provider(OpenAIProvider(), "openai")
        except Exception as e:
            print(f"[WARNING] Could not initialize OpenAI provider: {e}")

    return manager


# Convenience functions for backward compatibility
def create_llm_request(prompt: str, model: str, **kwargs) -> LLMRequest:
    """Create a standardized LLM request"""
    return LLMRequest(prompt=prompt, model=model, **kwargs)


def generate_with_provider(provider: LLMProvider, prompt: str, model: str, **kwargs) -> LLMResponse:
    """Generate response using a specific provider"""
    request = create_llm_request(prompt, model, **kwargs)
    return provider.generate(request)


if __name__ == "__main__":
    # Test the provider system
    print("Testing LLM Provider System")
    print("=" * 40)

    manager = create_default_manager()

    print(f"Available providers: {manager.list_providers()}")
    print(f"Online providers: {manager.get_available_providers()}")

    # Test auto-selection
    provider = manager.auto_select_provider()
    if provider:
        print(f"Selected provider: {provider.provider_name}")

        # Test simple request
        request = LLMRequest(
            prompt="Say hello in a friendly way",
            model="gpt-4o-mini" if provider.provider_name == "openai" else "gemma3:12b"
        )

        response = provider.generate(request)
        print(f"Test response: {response.success}")
        if response.success:
            print(f"Content: {response.content[:100]}...")
        else:
            print(f"Error: {response.error}")
    else:
        print("No providers available")
