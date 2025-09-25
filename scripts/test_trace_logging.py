#!/usr/bin/env python3
"""
Test script to verify trace logging functionality.
This script tests the TraceLogger class without requiring the full tax_data_updater setup.
"""

import sys
import os
import json
from datetime import datetime

# Add the current directory to Python path so we can import from tax_data_updater.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from tax_data_updater import TraceLogger
except ImportError as e:
    print(f"Error importing TraceLogger: {e}")
    print("Make sure you're running this from the scripts directory")
    sys.exit(1)

def test_trace_logging():
    """Test the trace logging functionality"""
    print("Testing TraceLogger functionality...")

    # Initialize logger
    logger = TraceLogger()

    # Generate trace ID
    trace_id = logger.generate_trace_id()
    print(f"Generated trace ID: {trace_id}")

    # Test request logging
    sample_payload = {
        "model": "gpt-test",
        "messages": [
            {"role": "user", "content": "Test content for taxation analysis"}
        ],
        "stream": False
    }

    print("Logging sample request...")
    logger.log_request(
        trace_id=trace_id,
        country_key="test_country",
        thread_id=1,
        request_payload=sample_payload,
        request_url="http://localhost:5001/chat",
        model_name="gpt-test"
    )

    # Test response logging
    sample_extracted_data = {
        "name": "Test Country",
        "currency": "TEST",
        "system": "flat",
        "countryCode": "TC",
        "coordinates": [0.0, 0.0],
        "brackets": [{"min": 0, "max": None, "rate": 20}],
        "vat": {"hasVAT": True, "standard": 10.0, "description": "Standard 10.0%"}
    }

    print("Logging sample response...")
    logger.log_response(
        trace_id=trace_id,
        country_key="test_country",
        thread_id=1,
        response_status=200,
        response_content='{"name": "Test Country", "currency": "TEST", ...}',
        processing_time=2.5,
        validation_result=True,
        extracted_data=sample_extracted_data
    )

    # Test summary logging
    print("Logging sample summary...")
    logger.log_summary(
        trace_id=trace_id,
        country_key="test_country",
        thread_id=1,
        success=True,
        final_data=sample_extracted_data,
        fallback_used=False
    )

    # Verify files were created
    expected_files = [
        f"logs/{trace_id}_request.log",
        f"logs/{trace_id}_response.log",
        f"logs/{trace_id}_summary.log"
    ]

    print("\nVerifying log files were created:")
    all_files_exist = True
    for file_path in expected_files:
        if os.path.exists(file_path):
            print(f"[OK] {file_path} - Created successfully")
            # Show file size
            size = os.path.getsize(file_path)
            print(f"  File size: {size} bytes")

            # Validate JSON content
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    print(f"  [OK] Valid JSON with trace_id: {data.get('trace_id', 'N/A')}")
            except json.JSONDecodeError as e:
                print(f"  [ERROR] Invalid JSON: {e}")
                all_files_exist = False
        else:
            print(f"[ERROR] {file_path} - Missing!")
            all_files_exist = False

    if all_files_exist:
        print(f"\n[SUCCESS] All trace logging tests passed!")
        print(f"Trace ID used: {trace_id}")
        print(f"Log files created in: logs/")
        return True
    else:
        print(f"\n[FAILED] Some trace logging tests failed!")
        return False

if __name__ == "__main__":
    try:
        success = test_trace_logging()
        if success:
            print("\nTrace logging is working correctly!")
        else:
            print("\nTrace logging has issues that need to be addressed.")

    except Exception as e:
        print(f"Error during testing: {e}")
        import traceback
        traceback.print_exc()