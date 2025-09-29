#!/usr/bin/env python3
"""
Test script to verify LLM provider initialization behavior
"""

import sys
import os

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tax_data_updater import TaxDataProcessor

def test_provider_initialization():
    """Test different provider initialization scenarios"""

    print("Testing LLM Provider Initialization")
    print("=" * 50)

    # Test 1: Explicit Ollama provider
    print("\n1. Testing explicit Ollama provider:")
    processor1 = TaxDataProcessor(
        provider="ollama",
        model_name="gemma3:12b"
    )
    print(f"   Initialized providers: {processor1.llm_manager.list_providers()}")

    # Test 2: Explicit OpenAI provider
    print("\n2. Testing explicit OpenAI provider:")
    processor2 = TaxDataProcessor(
        provider="openai",
        model_name="gpt-4o-mini"
    )
    print(f"   Initialized providers: {processor2.llm_manager.list_providers()}")

    # Test 3: Auto with local model
    print("\n3. Testing auto with local model:")
    processor3 = TaxDataProcessor(
        provider="auto",
        model_name="llama2:latest"
    )
    print(f"   Initialized providers: {processor3.llm_manager.list_providers()}")

    # Test 4: Auto with OpenAI model
    print("\n4. Testing auto with OpenAI model:")
    processor4 = TaxDataProcessor(
        provider="auto",
        model_name="gpt-4o-mini"
    )
    print(f"   Initialized providers: {processor4.llm_manager.list_providers()}")

    print("\n" + "=" * 50)
    print("Test completed!")

if __name__ == "__main__":
    test_provider_initialization()