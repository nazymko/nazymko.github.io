#!/usr/bin/env python3
"""
Debug script to understand GPT-5-nano response structure
"""

import sys
import os
import json

# Add the parent directory to the Python path so we can import from scripts/
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from llm_providers import OpenAIProvider, LLMRequest

def debug_gpt5_response():
    """Test GPT-5-nano response structure"""

    print("GPT-5-nano Response Structure Debug")
    print("=" * 50)

    try:
        # Create OpenAI provider
        provider = OpenAIProvider()
        print("[OK] OpenAI provider created")

        # Create a simple request
        request = LLMRequest(
            prompt="Return the JSON: {\"test\": \"hello world\", \"number\": 42}",
            model="gpt-5-nano",
            temperature=0.7
        )

        print(f"[REQUEST] Sending test request to {request.model}")
        print(f"[PROMPT] {request.prompt}")

        # Make the request
        response = provider.generate(request)

        print(f"\n[RESPONSE] Success: {response.success}")
        print(f"[RESPONSE] Content length: {len(response.content) if response.content else 0}")
        print(f"[RESPONSE] Content: {repr(response.content)}")
        print(f"[RESPONSE] Error: {response.error}")

        if response.raw_response:
            print(f"\n[RAW] Raw response type: {type(response.raw_response)}")
            print(f"[RAW] Raw response: {response.raw_response}")

            # Try to access different possible attributes
            if hasattr(response.raw_response, 'text'):
                print(f"[RAW] .text attribute: {response.raw_response.text}")
            if hasattr(response.raw_response, 'content'):
                print(f"[RAW] .content attribute: {response.raw_response.content}")
            if hasattr(response.raw_response, 'output'):
                print(f"[RAW] .output attribute: {response.raw_response.output}")

    except Exception as e:
        print(f"[ERROR] {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_gpt5_response()