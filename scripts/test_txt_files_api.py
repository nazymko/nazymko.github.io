#!/usr/bin/env python3
"""
Test script for the new /txt-files API functionality
"""

import sys
import os
from unittest.mock import Mock, patch

# Add the current directory to Python path to import the function
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generate_enhanced_taxation_files import list_txt_files, Colors

def test_txt_files_api():
    """Test the txt-files API functionality"""

    print(f"{Colors.CYAN}Testing /txt-files API functionality{Colors.RESET}")
    print("=" * 50)

    # Mock successful response
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.json.return_value = {
        "success": True,
        "txt_files": ["taxation_germany.txt", "taxation_france.txt", "requirements.txt"],
        "count": 3,
        "files_info": {
            "taxation_germany.txt": {
                "file_size": 5432,
                "created_at": "2023-12-07T10:30:45.123456",
                "modified_at": "2023-12-07T10:30:45.123456",
                "created_by_app": True,
                "memory_details": {
                    "url": "https://en.wikipedia.org/wiki/Taxation_in_Germany",
                    "saved_at": "2023-12-07T10:30:45.123456"
                }
            },
            "taxation_france.txt": {
                "file_size": 3210,
                "created_at": "2023-12-07T09:15:30.123456",
                "modified_at": "2023-12-07T09:15:30.123456",
                "created_by_app": True,
                "memory_details": {
                    "url": "https://en.wikipedia.org/wiki/Taxation_in_France",
                    "saved_at": "2023-12-07T09:15:30.123456"
                }
            },
            "requirements.txt": {
                "file_size": 152,
                "created_at": "2023-12-06T08:00:00.123456",
                "modified_at": "2023-12-06T08:00:00.123456",
                "created_by_app": False
            }
        }
    }

    print("Test 1: Successful response with mixed files")
    with patch('requests.get', return_value=mock_response):
        result = list_txt_files("http://localhost:5000")

        assert result is not None, "Should return result"
        assert result['success'] == True, "Should be successful"
        assert result['count'] == 3, "Should have 3 files"
        assert len(result['files']) == 3, "Should list 3 files"

        print(f"{Colors.GREEN}[PASS] Test 1 passed{Colors.RESET}")

    # Mock failed response
    mock_failed_response = Mock()
    mock_failed_response.status_code = 500
    mock_failed_response.text = "Internal Server Error"

    print("\nTest 2: Failed response (HTTP 500)")
    with patch('requests.get', return_value=mock_failed_response):
        result = list_txt_files("http://localhost:5000")

        assert result is None, "Should return None on failure"
        print(f"{Colors.GREEN}[PASS] Test 2 passed{Colors.RESET}")

    # Mock connection error
    print("\nTest 3: Connection error")
    with patch('requests.get', side_effect=Exception("Connection refused")):
        result = list_txt_files("http://localhost:5000")

        assert result is None, "Should return None on connection error"
        print(f"{Colors.GREEN}[PASS] Test 3 passed{Colors.RESET}")

    # Mock empty response
    mock_empty_response = Mock()
    mock_empty_response.status_code = 200
    mock_empty_response.json.return_value = {
        "success": True,
        "txt_files": [],
        "count": 0,
        "files_info": {}
    }

    print("\nTest 4: Empty file list")
    with patch('requests.get', return_value=mock_empty_response):
        result = list_txt_files("http://localhost:5000")

        assert result is not None, "Should return result"
        assert result['count'] == 0, "Should have 0 files"
        assert len(result['files']) == 0, "Should list 0 files"

        print(f"{Colors.GREEN}[PASS] Test 4 passed{Colors.RESET}")

    print(f"\n{Colors.GREEN}[SUCCESS] All txt-files API tests passed!{Colors.RESET}")

if __name__ == "__main__":
    test_txt_files_api()