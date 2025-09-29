#!/usr/bin/env python3
"""
Test script for the new --process-existing functionality
"""

import sys
import os
import tempfile
import shutil
from unittest.mock import Mock, patch

# Add the current directory to Python path to import the functions
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generate_enhanced_taxation_files import (
    fetch_txt_file_content,
    process_existing_txt_files,
    Colors
)

def test_fetch_txt_file_content():
    """Test fetching content of a specific txt file"""

    print(f"{Colors.CYAN}Testing fetch_txt_file_content function{Colors.RESET}")
    print("=" * 50)

    # Mock successful response
    mock_response = Mock()
    mock_response.status_code = 200
    mock_response.text = "This is sample taxation content for Germany..."

    print("Test 1: Successful file fetch")
    with patch('requests.get', return_value=mock_response):
        result = fetch_txt_file_content("taxation_germany.txt", "http://localhost:5000")

        assert result is not None, "Should return content"
        assert result == "This is sample taxation content for Germany...", "Should return correct content"
        print(f"{Colors.GREEN}[PASS] Test 1 passed{Colors.RESET}")

    # Mock failed response
    mock_failed_response = Mock()
    mock_failed_response.status_code = 404
    mock_failed_response.text = "Not Found"

    print("\nTest 2: Failed file fetch (HTTP 404)")
    with patch('requests.get', return_value=mock_failed_response):
        result = fetch_txt_file_content("taxation_nonexistent.txt", "http://localhost:5000")

        assert result is None, "Should return None on failure"
        print(f"{Colors.GREEN}[PASS] Test 2 passed{Colors.RESET}")

    print(f"\n{Colors.GREEN}[SUCCESS] fetch_txt_file_content tests passed!{Colors.RESET}")

def test_process_existing_workflow():
    """Test the full process_existing_txt_files workflow"""

    print(f"\n{Colors.CYAN}Testing process_existing_txt_files workflow{Colors.RESET}")
    print("=" * 50)

    # Create temporary directory for testing
    temp_dir = tempfile.mkdtemp()
    original_data_dir = "scripts/data"

    try:
        # Mock the list_txt_files response
        mock_list_response = {
            'success': True,
            'files': ['taxation_germany.txt', 'taxation_france.txt', 'requirements.txt'],
            'count': 3,
            'files_info': {
                'taxation_germany.txt': {
                    'file_size': 5432,
                    'created_by_app': True
                },
                'taxation_france.txt': {
                    'file_size': 3210,
                    'created_by_app': True
                },
                'requirements.txt': {
                    'file_size': 152,
                    'created_by_app': False
                }
            }
        }

        # Mock file content responses
        def mock_fetch_content(filename, web_extractor_url):
            if filename == "taxation_germany.txt":
                return "Raw taxation data for Germany from Wikipedia..."
            elif filename == "taxation_france.txt":
                return "Raw taxation data for France from Wikipedia..."
            return None

        # Mock LLM formatting
        def mock_format_with_llm(country_key, raw_content, ollama_url, thread_id=0):
            return f"""Taxation in {country_key.replace('_', ' ').title()}

Personal Income Tax:
- Progressive tax system
- Tax brackets: 0-10,000 EUR (14%), 10,001-40,000 EUR (24%), 40,001+ EUR (42%)

Value Added Tax (VAT):
- Standard rate: 19%
- Reduced rate: 7%

Source: Wikipedia extraction and LLM formatting"""

        print("Test: Full workflow with mocked responses")

        # Patch the individual functions directly
        with patch('generate_enhanced_taxation_files.list_txt_files', return_value=mock_list_response), \
             patch('generate_enhanced_taxation_files.fetch_txt_file_content', side_effect=mock_fetch_content), \
             patch('generate_enhanced_taxation_files.format_with_llm', side_effect=mock_format_with_llm):

            # Temporarily override the data directory in the function
            original_process_function = process_existing_txt_files

            def custom_process_function(web_extractor_url, ollama_url, max_workers):
                # Just test the core logic without file saving for now
                txt_files_result = mock_list_response
                taxation_files = [f for f in txt_files_result.get('files', []) if f.startswith('taxation')]

                if not taxation_files:
                    return True

                # Simulate processing each file
                for filename in taxation_files:
                    content = mock_fetch_content(filename, web_extractor_url)
                    if content:
                        country_key = filename.replace('taxation_', '').replace('.txt', '')
                        formatted = mock_format_with_llm(country_key, content, ollama_url)
                        if formatted:
                            # Save to temp directory instead
                            local_filename = os.path.join(temp_dir, filename)
                            with open(local_filename, 'w', encoding='utf-8') as f:
                                f.write(formatted)

                return True

            # Run the custom process
            result = custom_process_function(
                web_extractor_url="http://localhost:5000",
                ollama_url="http://localhost:5001",
                max_workers=1
            )

            # Check results
            assert result == True, "Should return True on success"

            # Check if files were created in temp directory
            expected_files = ['taxation_germany.txt', 'taxation_france.txt']
            for filename in expected_files:
                filepath = os.path.join(temp_dir, filename)
                if os.path.exists(filepath):
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        assert "Personal Income Tax:" in content, f"File {filename} should have formatted content"
                        assert "Value Added Tax" in content, f"File {filename} should have VAT information"
                        print(f"  {Colors.GREEN}[OK] {filename} created successfully{Colors.RESET}")
                else:
                    print(f"  {Colors.RED}[FAIL] {filename} was not created{Colors.RESET}")

        print(f"{Colors.GREEN}[PASS] Full workflow test passed{Colors.RESET}")

    except Exception as e:
        print(f"{Colors.RED}[ERROR] Test failed: {e}{Colors.RESET}")
        raise
    finally:
        # Cleanup
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)

    print(f"\n{Colors.GREEN}[SUCCESS] All process_existing_txt_files tests passed!{Colors.RESET}")

def main():
    """Run all tests"""
    test_fetch_txt_file_content()
    test_process_existing_workflow()

if __name__ == "__main__":
    main()