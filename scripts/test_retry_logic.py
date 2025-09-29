#!/usr/bin/env python3
"""
Test script to verify retry logic for 500 errors
"""

import time
import requests
from unittest.mock import Mock, patch

# Import the functions we modified
from generate_enhanced_taxation_files import process_chunk_with_llm, aggregate_chunks_with_llm, Colors

def test_retry_logic():
    """Test the retry logic for 500 errors"""

    print("Testing retry logic for 500 errors...")

    # Mock a 500 error response
    mock_response_500 = Mock()
    mock_response_500.status_code = 500
    mock_response_500.text = "Internal Server Error"

    # Mock a successful response
    mock_response_200 = Mock()
    mock_response_200.status_code = 200
    mock_response_200.json.return_value = {
        "message": {
            "content": "Test response content"
        }
    }

    # Test 1: All attempts fail with 500
    print("\nTest 1: All attempts fail with 500")
    with patch('requests.post', return_value=mock_response_500):
        start_time = time.time()
        result = process_chunk_with_llm(
            country="test_country",
            chunk="test chunk content",
            chunk_number=1,
            total_chunks=1,
            ollama_url="http://localhost:5001",
            model="test-model",
            thread_id=1,
            max_retries=3
        )
        end_time = time.time()

        print(f"Result: {result}")
        print(f"Time taken: {end_time - start_time:.2f}s")
        assert result is None, "Should return None after all retries fail"
        assert end_time - start_time >= 3, "Should wait for exponential backoff (1+2=3s minimum)"

    # Test 2: Success after 2 retries
    print("\nTest 2: Success after 2 retries")
    responses = [mock_response_500, mock_response_500, mock_response_200]
    with patch('requests.post', side_effect=responses):
        start_time = time.time()
        result = process_chunk_with_llm(
            country="test_country",
            chunk="test chunk content",
            chunk_number=1,
            total_chunks=1,
            ollama_url="http://localhost:5001",
            model="test-model",
            thread_id=1,
            max_retries=3
        )
        end_time = time.time()

        print(f"Result: {result}")
        print(f"Time taken: {end_time - start_time:.2f}s")
        assert result == "Test response content", "Should succeed after retries"
        assert 3 <= end_time - start_time < 5, "Should wait 1+2=3s for 2 retries"

    # Test 3: Immediate success (no retries)
    print("\nTest 3: Immediate success (no retries)")
    with patch('requests.post', return_value=mock_response_200):
        start_time = time.time()
        result = process_chunk_with_llm(
            country="test_country",
            chunk="test chunk content",
            chunk_number=1,
            total_chunks=1,
            ollama_url="http://localhost:5001",
            model="test-model",
            thread_id=1,
            max_retries=3
        )
        end_time = time.time()

        print(f"Result: {result}")
        print(f"Time taken: {end_time - start_time:.2f}s")
        assert result == "Test response content", "Should succeed immediately"
        assert end_time - start_time < 1, "Should not wait for retries"

    # Test 4: Test aggregate function retry logic
    print("\nTest 4: Testing aggregate function retry logic")
    with patch('requests.post', side_effect=[mock_response_500, mock_response_200]):
        start_time = time.time()
        result = aggregate_chunks_with_llm(
            country="test_country",
            chunk_summaries=["summary 1", "summary 2"],
            ollama_url="http://localhost:5001",
            model="test-model",
            thread_id=1,
            max_retries=3
        )
        end_time = time.time()

        print(f"Result: {result}")
        print(f"Time taken: {end_time - start_time:.2f}s")
        assert result == "Test response content", "Aggregate should succeed after retry"
        assert 1 <= end_time - start_time < 3, "Should wait 1s for 1 retry"

    print(f"\n{Colors.GREEN}[SUCCESS] All retry logic tests passed!{Colors.RESET}")

if __name__ == "__main__":
    test_retry_logic()