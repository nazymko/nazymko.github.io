#!/usr/bin/env python3
"""
Test script to demonstrate colored output
"""

import sys
import os

# Add the current directory to Python path to import the Colors class
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from generate_enhanced_taxation_files import Colors

def test_colored_output():
    """Test colored terminal output"""

    print("Testing colored terminal output:")
    print("=" * 50)

    # Test all color codes
    print(f"{Colors.RED}[ERROR] This is a red error message{Colors.RESET}")
    print(f"{Colors.YELLOW}[WARNING] This is a yellow warning message{Colors.RESET}")
    print(f"{Colors.GREEN}[SUCCESS] This is a green success message{Colors.RESET}")
    print(f"{Colors.BLUE}[INFO] This is a blue info message{Colors.RESET}")
    print(f"{Colors.CYAN}[DEBUG] This is a cyan debug message{Colors.RESET}")
    print(f"{Colors.MAGENTA}[TRACE] This is a magenta trace message{Colors.RESET}")

    # Test bold text
    print(f"{Colors.BOLD}{Colors.RED}[CRITICAL ERROR] This is bold red text{Colors.RESET}")

    # Test mixed formatting
    print(f"{Colors.GREEN}[SUCCESS]{Colors.RESET} Processing completed with {Colors.RED}3 errors{Colors.RESET} and {Colors.YELLOW}2 warnings{Colors.RESET}")

    print("\n" + "=" * 50)
    print("Color test completed!")

if __name__ == "__main__":
    test_colored_output()