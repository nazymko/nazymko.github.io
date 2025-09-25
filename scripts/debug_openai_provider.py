#!/usr/bin/env python3
"""
Debug OpenAI provider initialization
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from llm_providers import OpenAIProvider, LLMRequest

def test_openai_provider():
    """Test OpenAI provider initialization and basic functionality"""
    print("Testing OpenAI Provider")
    print("=" * 30)

    try:
        # Test 1: Initialize provider
        print("\n1. Initializing OpenAI provider...")
        provider = OpenAIProvider()
        print(f"   Provider created: {provider.provider_name}")

        # Test 2: Check availability
        print("\n2. Checking availability...")
        is_available = provider.is_available()
        print(f"   Available: {is_available}")

        if not is_available:
            print("   [ERROR] Provider not available - check API key")
            return False

        # Test 3: List models
        print("\n3. Listing models...")
        models = provider.list_models()
        print(f"   Available models: {models[:5]}...")  # Show first 5

        # Test 4: Simple request (test both standard and reasoning models)
        print("\n4. Testing simple request...")

        # Test with standard model first
        request = LLMRequest(
            prompt="Say 'Hello' in JSON format with a single 'message' field",
            model="gpt-4o-mini",
            max_tokens=50
        )

        response = provider.generate(request)
        print(f"   Standard model success: {response.success}")
        if response.success:
            print(f"   Response: {response.content[:100]}...")
            if response.token_usage:
                print(f"   Tokens: {response.token_usage}")
        else:
            print(f"   Error: {response.error}")

        # Test with reasoning model if available
        print("\n5. Testing reasoning model...")
        reasoning_request = LLMRequest(
            prompt="Explain why 2+2=4 and provide the answer in JSON format",
            model="gpt-5-nano",
            max_tokens=100
        )

        reasoning_response = provider.generate(reasoning_request)
        print(f"   Reasoning model success: {reasoning_response.success}")
        if reasoning_response.success:
            print(f"   Response: {reasoning_response.content[:100]}...")
        else:
            print(f"   Error: {reasoning_response.error}")

        # Return overall success
        return response.success or reasoning_response.success

    except Exception as e:
        print(f"[ERROR] Exception during testing: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_openai_provider()
    if success:
        print("\n[SUCCESS] OpenAI provider is working correctly!")
    else:
        print("\n[FAILED] OpenAI provider has issues")