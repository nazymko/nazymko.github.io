#!/usr/bin/env python3
"""
Move taxation files from project root to scripts/data directory
"""

import os
import shutil
import glob

def move_taxation_files():
    """Move taxation_*.txt files from root to scripts/data/"""

    # Ensure data directory exists
    data_dir = "scripts/data"
    os.makedirs(data_dir, exist_ok=True)

    # Find all taxation files in the root directory
    root_files = glob.glob("taxation_*.txt")

    if not root_files:
        print("[INFO] No taxation files found in project root")
        return

    print(f"[MOVE] Found {len(root_files)} taxation files in project root")

    moved_count = 0
    skipped_count = 0

    for filename in root_files:
        target_path = os.path.join(data_dir, filename)

        if os.path.exists(target_path):
            # File already exists in target directory
            print(f"[SKIP] {filename} already exists in {data_dir}/")
            skipped_count += 1
        else:
            # Move the file
            try:
                shutil.move(filename, target_path)
                print(f"[MOVED] {filename} -> {target_path}")
                moved_count += 1
            except Exception as e:
                print(f"[ERROR] Failed to move {filename}: {e}")

    print(f"\n[SUMMARY] File movement completed:")
    print(f"   [MOVED] Files moved: {moved_count}")
    print(f"   [SKIPPED] Files skipped: {skipped_count}")
    print(f"   [TOTAL] Files processed: {len(root_files)}")

    if moved_count > 0:
        print(f"\n[SUCCESS] Moved {moved_count} files to {data_dir}/ directory")

if __name__ == "__main__":
    print("Taxation File Mover")
    print("=" * 30)
    move_taxation_files()