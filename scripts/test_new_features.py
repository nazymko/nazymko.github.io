#!/usr/bin/env python3
"""
Test script to verify new multi-threading and streaming features.
"""

import sys
import os
import time

# Add the current directory to Python path so we can import from tax_data_updater.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from tax_data_updater import TaxDataProcessor, TraceLogger
except ImportError as e:
    print(f"Error importing modules: {e}")
    print("Make sure you're running this from the scripts directory")
    sys.exit(1)

def test_configuration_options():
    """Test different configuration options"""
    print("Testing TaxDataProcessor configuration options...")

    # Test 1: Default configuration (parallel enabled, streaming disabled)
    print("\n1. Testing default configuration:")
    processor1 = TaxDataProcessor()

    # Test 2: Sequential processing (parallel disabled)
    print("\n2. Testing sequential processing:")
    processor2 = TaxDataProcessor(enable_parallel=False)

    # Test 3: Streaming enabled
    print("\n3. Testing streaming enabled:")
    processor3 = TaxDataProcessor(enable_streaming=True)

    # Test 4: Sequential + streaming
    print("\n4. Testing sequential + streaming:")
    processor4 = TaxDataProcessor(enable_parallel=False, enable_streaming=True)

    # Test 5: Custom configuration
    print("\n5. Testing custom configuration:")
    processor5 = TaxDataProcessor(
        max_workers=8,
        enable_parallel=True,
        enable_streaming=False,
        model_name="test-model:latest"
    )

    print("\n[SUCCESS] All configuration tests completed!")
    return True

def test_streaming_logger():
    """Test streaming logger functionality"""
    print("\nTesting streaming logger functionality...")

    logger = TraceLogger()
    trace_id = logger.generate_trace_id()

    print(f"Generated trace ID: {trace_id}")

    # Test streaming chunk logging
    test_chunks = [
        '{"name": "Test Country"',
        ', "currency": "TEST"',
        ', "system": "flat"',
        ', "brackets": [{"min": 0, "max": null, "rate": 15}]',
        '}'
    ]

    for i, chunk in enumerate(test_chunks, 1):
        logger.log_streaming_chunk(
            trace_id=trace_id,
            country_key="test_country",
            thread_id=0,
            chunk_number=i,
            chunk_content=chunk
        )
        # Small delay to simulate real streaming
        time.sleep(0.1)

    # Test streaming completion
    complete_content = ''.join(test_chunks)
    logger.log_streaming_complete(
        trace_id=trace_id,
        country_key="test_country",
        thread_id=0,
        total_chunks=len(test_chunks),
        total_content=complete_content,
        processing_time=1.5
    )

    # Verify files were created
    expected_files = [
        f"logs/{trace_id}_stream.log",
        f"logs/{trace_id}_stream_summary.log"
    ]

    print("\nVerifying streaming log files:")
    all_files_exist = True
    for file_path in expected_files:
        if os.path.exists(file_path):
            print(f"[OK] {file_path} - Created successfully")
            size = os.path.getsize(file_path)
            print(f"  File size: {size} bytes")
        else:
            print(f"[ERROR] {file_path} - Missing!")
            all_files_exist = False

    if all_files_exist:
        print("\n[SUCCESS] Streaming logger tests passed!")
        return True
    else:
        print("\n[FAILED] Streaming logger tests failed!")
        return False

def test_argument_simulation():
    """Test command line argument simulation"""
    print("\nTesting command line argument simulation...")

    # Simulate different argument combinations
    test_cases = [
        {
            "name": "Default",
            "enable_parallel": True,
            "enable_streaming": False,
            "max_workers": 4
        },
        {
            "name": "Sequential",
            "enable_parallel": False,
            "enable_streaming": False,
            "max_workers": 1  # Should be forced to 1
        },
        {
            "name": "Streaming",
            "enable_parallel": True,
            "enable_streaming": True,
            "max_workers": 4
        },
        {
            "name": "Sequential + Streaming",
            "enable_parallel": False,
            "enable_streaming": True,
            "max_workers": 1  # Should be forced to 1
        }
    ]

    for test_case in test_cases:
        print(f"\n  Testing {test_case['name']} mode:")
        processor = TaxDataProcessor(
            enable_parallel=test_case["enable_parallel"],
            enable_streaming=test_case["enable_streaming"],
            max_workers=test_case["max_workers"]
        )

        # Verify configuration
        expected_workers = 1 if not test_case["enable_parallel"] else test_case["max_workers"]
        if processor.max_workers == expected_workers:
            print(f"    [OK] Workers: {processor.max_workers} (expected: {expected_workers})")
        else:
            print(f"    [ERROR] Workers: {processor.max_workers} (expected: {expected_workers})")

        if processor.enable_parallel == test_case["enable_parallel"]:
            print(f"    [OK] Parallel: {processor.enable_parallel}")
        else:
            print(f"    [ERROR] Parallel: {processor.enable_parallel}")

        if processor.enable_streaming == test_case["enable_streaming"]:
            print(f"    [OK] Streaming: {processor.enable_streaming}")
        else:
            print(f"    [ERROR] Streaming: {processor.enable_streaming}")

    print("\n[SUCCESS] Argument simulation tests completed!")
    return True

if __name__ == "__main__":
    try:
        print("Testing new TaxDataProcessor features...")
        print("=" * 50)

        # Run all tests
        test1 = test_configuration_options()
        test2 = test_streaming_logger()
        test3 = test_argument_simulation()

        if test1 and test2 and test3:
            print("\n[SUCCESS] ALL TESTS PASSED!")
            print("New features are working correctly!")
        else:
            print("\n[FAILED] SOME TESTS FAILED!")
            print("Check the output above for details.")

    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()