#!/usr/bin/env python3
"""
Enhanced taxation file generator that creates well-formatted content
using LLM to restructure Wikipedia content
"""

import requests
import time
import os
import concurrent.futures
import threading
from urllib.parse import quote

# ANSI Color codes for terminal output
class Colors:
    RED = '\033[91m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    MAGENTA = '\033[95m'
    CYAN = '\033[96m'
    WHITE = '\033[97m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

# Import LLM provider system
try:
    from llm_providers import (
        LLMProviderManager,
        LLMRequest,
        LLMResponse,
        OllamaProvider,
        OpenAIProvider,
        create_default_manager
    )
    LLM_PROVIDERS_AVAILABLE = True
except ImportError:
    print(f"{Colors.YELLOW}[WARNING] LLM providers module not found. Using legacy direct requests.{Colors.RESET}")
    LLM_PROVIDERS_AVAILABLE = False

# List of all countries
COUNTRIES = [
    "albania", "andorra", "argentina", "australia", "austria", "belgium",
    "bosnia_and_herzegovina", "brazil", "bulgaria", "canada", "china",
    "croatia", "cyprus", "czech_republic", "denmark", "estonia", "finland",
    "france", "germany", "greece", "hong_kong", "hungary", "iceland",
    "india", "indonesia", "ireland", "italy", "japan", "latvia",
    "liechtenstein", "lithuania", "luxembourg", "malta", "montenegro",
    "netherlands", "north_korea", "norway", "poland", "portugal",
    "russia", "serbia", "singapore", "slovakia", "south_africa",
    "spain", "sweden", "switzerland", "taiwan", "ukraine",
    "united_arab_emirates", "united_kingdom", "united_states"
]

# URL mapping for countries with different Wikipedia page names
URL_MAPPING = {
    "bosnia_and_herzegovina": "Bosnia_and_Herzegovina",
    "czech_republic": "Czech_Republic",
    "hong_kong": "Hong_Kong",
    "north_korea": "North_Korea",
    "south_africa": "South_Africa",
    "united_arab_emirates": "United_Arab_Emirates",
    "united_kingdom": "United_Kingdom",
    "united_states": "United_States"
}

def get_wikipedia_url(country):
    """Generate Wikipedia taxation URL for a country"""
    if country in URL_MAPPING:
        country_name = URL_MAPPING[country]
    else:
        country_name = country.replace("_", "_").title()
    return f"https://en.wikipedia.org/wiki/Taxation_in_{country_name}"

def fetch_raw_content(country, web_extractor_url="http://localhost:5000"):
    """Fetch raw Wikipedia content"""
    url = get_wikipedia_url(country)

    print(f"[API-CALL] POST {web_extractor_url}/extract")
    print(f"[WIKIPEDIA-URL] Fetching: {url}")

    try:
        request_payload = {"url": url}
        print(f"[API-PAYLOAD] {request_payload}")
        print(f"[API-TIMEOUT] Request timeout: 30 seconds")

        response = requests.post(
            f"{web_extractor_url}/extract",
            json=request_payload,
            timeout=30
        )

        print(f"[API-RESPONSE] HTTP {response.status_code} from Web Content Extractor")

        if response.status_code == 200:
            data = response.json()
            print(f"[API-DATA] Response contains {len(str(data))} characters")
            if data.get('success'):
                content = data.get('content', '')
                print(f"[WIKIPEDIA-CONTENT] Extracted {len(content)} characters from Wikipedia")
                return content
            else:
                print(f"{Colors.RED}[ERROR] Web extractor reported failure{Colors.RESET}")
                print(f"[DEBUG] Response data: {data}")
        else:
            print(f"{Colors.RED}[ERROR] Web extractor returned HTTP {response.status_code}{Colors.RESET}")
        return None
    except Exception as e:
        print(f"{Colors.RED}[ERROR] Failed to fetch content: {e}{Colors.RESET}")
        return None

def list_txt_files(web_extractor_url="http://localhost:5000"):
    """List all txt files in the web extractor directory"""

    print(f"[API-CALL] GET {web_extractor_url}/txt-files")
    print(f"[TXT-FILES] Fetching list of available txt files")

    try:
        print(f"[API-TIMEOUT] Request timeout: 30 seconds")

        response = requests.get(
            f"{web_extractor_url}/txt-files",
            timeout=30
        )

        print(f"[API-RESPONSE] HTTP {response.status_code} from Web Content Extractor")

        if response.status_code == 200:
            data = response.json()
            print(f"[API-DATA] Response contains {len(str(data))} characters")

            if data.get('success'):
                txt_files = data.get('txt_files', [])
                count = data.get('count', 0)
                files_info = data.get('files_info', {})

                print(f"[TXT-FILES] Found {count} txt files")

                # Display file information
                for filename in txt_files:
                    file_info = files_info.get(filename, {})
                    file_size = file_info.get('file_size', 'Unknown')
                    created_by_app = file_info.get('created_by_app', False)

                    status = f"{Colors.GREEN}[APP-CREATED]{Colors.RESET}" if created_by_app else f"{Colors.CYAN}[EXTERNAL]{Colors.RESET}"
                    print(f"  - {filename} ({file_size:,} bytes) {status}")

                    # Show memory details if available
                    if 'memory_details' in file_info:
                        memory = file_info['memory_details']
                        if 'url' in memory:
                            print(f"    -> Source URL: {memory['url']}")

                return {
                    'success': True,
                    'files': txt_files,
                    'count': count,
                    'files_info': files_info
                }
            else:
                print(f"{Colors.RED}[ERROR] Web extractor reported failure for txt-files listing{Colors.RESET}")
                print(f"[DEBUG] Response data: {data}")
        else:
            print(f"{Colors.RED}[ERROR] Web extractor returned HTTP {response.status_code} for txt-files{Colors.RESET}")

        return None

    except Exception as e:
        print(f"{Colors.RED}[ERROR] Failed to list txt files: {e}{Colors.RESET}")
        return None

def fetch_txt_file_content(filename, web_extractor_url="http://localhost:5000"):
    """Fetch content of a specific txt file from web extractor"""

    print(f"[API-CALL] GET {web_extractor_url}/files/{filename}")
    print(f"[TXT-FILE] Fetching content of {filename}")

    try:
        print(f"[API-TIMEOUT] Request timeout: 30 seconds")

        response = requests.get(
            f"{web_extractor_url}/files/{filename}",
            timeout=30
        )

        print(f"[API-RESPONSE] HTTP {response.status_code} from Web Content Extractor")

        if response.status_code == 200:
            # Assuming the API returns plain text content
            content = response.text
            print(f"[TXT-FILE-CONTENT] Retrieved {len(content)} characters from {filename}")
            return content
        else:
            print(f"{Colors.RED}[ERROR] Web extractor returned HTTP {response.status_code} for {filename}{Colors.RESET}")
            return None

    except Exception as e:
        print(f"{Colors.RED}[ERROR] Failed to fetch {filename}: {e}{Colors.RESET}")
        return None

def chunk_content(content, chunk_size=6000):
    """Split content into chunks of specified size"""
    chunks = []
    for i in range(0, len(content), chunk_size):
        chunk = content[i:i + chunk_size]
        chunks.append(chunk)
    return chunks

def process_chunk_with_llm(country, chunk, chunk_number, total_chunks, ollama_url="http://localhost:5001", model="gemma3:12b", thread_id=0, provider="ollama", max_retries=3):
    """Process individual chunk with LLM with retry logic for 500 errors"""

    prompt = f"""
    You are processing chunk {chunk_number} of {total_chunks} from Wikipedia content about taxation in {country.replace('_', ' ').title()}.

    Extract and summarize ONLY the taxation-related information from this content chunk:

    {chunk}

    Focus on extracting:
    - Personal income tax rates and brackets
    - VAT/GST rates
    - Social security contributions
    - Special taxes or levies
    - Tax exemptions or deductions
    - Currency information
    - Recent tax changes

    Provide a concise summary of taxation information found in this chunk.
    If no taxation information is found, respond with "No taxation information in this chunk."
    """

    print(f"[LLM-CHUNK] Thread-{thread_id} Processing chunk {chunk_number}/{total_chunks} ({len(chunk)} chars)")

    request_payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }

    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{ollama_url}/chat",
                json=request_payload,
                timeout=300
            )

            if response.status_code == 200:
                llm_response = response.json()
                content = llm_response.get('message', {}).get('content', '')
                print(f"[LLM-CHUNK-SUCCESS] Thread-{thread_id} Chunk {chunk_number} processed ({len(content)} chars)")
                return content
            elif response.status_code == 500:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                    print(f"[RETRY] Thread-{thread_id} Chunk {chunk_number} failed with HTTP 500, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"{Colors.RED}[ERROR] Thread-{thread_id} Chunk {chunk_number} failed with HTTP 500 after {max_retries} attempts{Colors.RESET}")
                    return None
            else:
                print(f"{Colors.RED}[ERROR] Thread-{thread_id} Chunk {chunk_number} failed with HTTP {response.status_code}{Colors.RESET}")
                return None
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"[RETRY] Thread-{thread_id} Chunk {chunk_number} processing failed: {e}, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
                continue
            else:
                print(f"{Colors.RED}[ERROR] Thread-{thread_id} Chunk {chunk_number} processing failed after {max_retries} attempts: {e}{Colors.RESET}")
                return None

    return None

def aggregate_chunks_with_llm(country, chunk_summaries, ollama_url="http://localhost:5001", model="gemma3:12b", thread_id=0, max_retries=3):
    """Aggregate processed chunks into final structured format with retry logic for 500 errors"""

    combined_summaries = "\n\n".join([f"Summary {i+1}:\n{summary}" for i, summary in enumerate(chunk_summaries) if summary and summary.strip() != "No taxation information in this chunk."])

    prompt = f"""
    Please create a comprehensive, well-formatted taxation summary for {country.replace('_', ' ').title()} by combining the following extracted taxation information:

    {combined_summaries}

    Please create a well-formatted taxation summary with the following structure:

    Taxation in [Country Name]

    [Brief introduction paragraph about the tax system]

    Personal Income Tax:
    - Tax system type (progressive/flat/zero)
    - Current tax brackets with exact rates and income thresholds
    - Tax-free allowances or standard deductions

    Value Added Tax (VAT) / Goods and Services Tax (GST):
    - Standard rate
    - Reduced rates (if any)
    - Exemptions or zero-rated items

    Social Security and Other Taxes:
    - Social security contributions
    - Payroll taxes
    - Any special taxes (military, solidarity, etc.)

    Additional Information:
    - Tax year period
    - Important notes about calculation
    - Recent updates or changes

    Source: [Mention Wikipedia and current year]

    Focus on:
    1. Exact tax rates and income thresholds
    2. Current information (2025 where possible)
    3. Clear structure for easy parsing
    4. Numerical precision for tax brackets
    5. Currency specification
    6. Consolidate duplicate information
    7. Resolve any conflicts in the data

    Make it comprehensive but concise, focusing on information needed for tax calculations.
    """

    print(f"[LLM-AGGREGATE] Thread-{thread_id} Aggregating {len(chunk_summaries)} chunk summaries")

    request_payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "stream": False
    }

    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{ollama_url}/chat",
                json=request_payload,
                timeout=300
            )

            if response.status_code == 200:
                llm_response = response.json()
                content = llm_response.get('message', {}).get('content', '')
                print(f"[LLM-AGGREGATE-SUCCESS] Thread-{thread_id} Final aggregation completed ({len(content)} chars)")
                return content
            elif response.status_code == 500:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                    print(f"[RETRY] Thread-{thread_id} Aggregation failed with HTTP 500, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"{Colors.RED}[ERROR] Thread-{thread_id} Aggregation failed with HTTP 500 after {max_retries} attempts{Colors.RESET}")
                    return None
            else:
                print(f"{Colors.RED}[ERROR] Thread-{thread_id} Aggregation failed with HTTP {response.status_code}{Colors.RESET}")
                return None
        except Exception as e:
            if attempt < max_retries - 1:
                wait_time = 2 ** attempt
                print(f"[RETRY] Thread-{thread_id} Aggregation failed: {e}, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                time.sleep(wait_time)
                continue
            else:
                print(f"{Colors.RED}[ERROR] Thread-{thread_id} Aggregation failed after {max_retries} attempts: {e}{Colors.RESET}")
                return None

    return None

def format_with_llm(country, raw_content, ollama_url="http://localhost:5001", model="gemma3:12b", thread_id=0):
    """Use LLM to format raw Wikipedia content into structured taxation info with chunked processing"""

    print(f"[LLM-REQUEST] Thread-{thread_id} Starting chunked processing")
    print(f"[LLM-MODEL] Thread-{thread_id} Using model: {model}")
    print(f"[LLM-CONTENT] Thread-{thread_id} Processing {len(raw_content)} characters of Wikipedia content")
    print(f"[LLM-TIMEOUT] Thread-{thread_id} Request timeout: 300 seconds per chunk")

    # Check if content needs chunking
    chunk_size = 6000
    if len(raw_content) <= chunk_size:
        print(f"[LLM-SINGLE] Thread-{thread_id} Content fits in single request, processing normally")

        # Use original single-request approach for smaller content
        prompt = f"""
        Please reformat the following Wikipedia content about taxation in {country.replace('_', ' ').title()} into a clear, structured format suitable for tax calculation analysis.

        Original Wikipedia content:
        {raw_content}

        Please create a well-formatted taxation summary with the following structure:

        Taxation in [Country Name]

        [Brief introduction paragraph about the tax system]

        Personal Income Tax:
        - Tax system type (progressive/flat/zero)
        - Current tax brackets with exact rates and income thresholds
        - Tax-free allowances or standard deductions

        Value Added Tax (VAT) / Goods and Services Tax (GST):
        - Standard rate
        - Reduced rates (if any)
        - Exemptions or zero-rated items

        Social Security and Other Taxes:
        - Social security contributions
        - Payroll taxes
        - Any special taxes (military, solidarity, etc.)

        Additional Information:
        - Tax year period
        - Important notes about calculation
        - Recent updates or changes

        Source: [Mention Wikipedia and current year]

        Focus on:
        1. Exact tax rates and income thresholds
        2. Current information (2025 where possible)
        3. Clear structure for easy parsing
        4. Numerical precision for tax brackets
        5. Currency specification

        Make it comprehensive but concise, focusing on information needed for tax calculations.
        """

        request_payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False
        }

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = requests.post(
                    f"{ollama_url}/chat",
                    json=request_payload,
                    timeout=300
                )

                if response.status_code == 200:
                    llm_response = response.json()
                    content = llm_response.get('message', {}).get('content', '')
                    print(f"[LLM-SUCCESS] Thread-{thread_id} Single-request processing completed ({len(content)} chars)")
                    return content
                elif response.status_code == 500:
                    if attempt < max_retries - 1:
                        wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
                        print(f"[RETRY] Thread-{thread_id} Single request failed with HTTP 500, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                        time.sleep(wait_time)
                        continue
                    else:
                        print(f"{Colors.RED}[ERROR] Thread-{thread_id} Single request failed with HTTP 500 after {max_retries} attempts{Colors.RESET}")
                        return None
                else:
                    print(f"{Colors.RED}[ERROR] Thread-{thread_id} Single request failed with HTTP {response.status_code}{Colors.RESET}")
                    return None
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"[RETRY] Thread-{thread_id} Single request failed: {e}, retrying in {wait_time}s (attempt {attempt + 1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                else:
                    print(f"{Colors.RED}[ERROR] Thread-{thread_id} Single request failed after {max_retries} attempts: {e}{Colors.RESET}")
                    return None

        return None

    else:
        # Use chunked processing for large content
        print(f"[LLM-CHUNKED] Thread-{thread_id} Content requires chunking (>{chunk_size} chars)")

        # Step 1: Split content into chunks
        chunks = chunk_content(raw_content, chunk_size)
        print(f"[LLM-CHUNKS] Thread-{thread_id} Split into {len(chunks)} chunks")

        # Step 2: Process each chunk
        chunk_summaries = []
        for i, chunk in enumerate(chunks, 1):
            summary = process_chunk_with_llm(country, chunk, i, len(chunks), ollama_url, model, thread_id)
            if summary:
                chunk_summaries.append(summary)
            else:
                print(f"{Colors.YELLOW}[WARNING] Thread-{thread_id} Chunk {i} processing failed, continuing with remaining chunks{Colors.RESET}")

        if not chunk_summaries:
            print(f"{Colors.RED}[ERROR] Thread-{thread_id} All chunk processing failed{Colors.RESET}")
            return None

        print(f"[LLM-CHUNK-SUMMARY] Thread-{thread_id} Successfully processed {len(chunk_summaries)}/{len(chunks)} chunks")

        # Step 3: Aggregate chunk summaries into final format
        final_content = aggregate_chunks_with_llm(country, chunk_summaries, ollama_url, model, thread_id)

        if final_content:
            print(f"[LLM-SUCCESS] Thread-{thread_id} Chunked processing completed ({len(final_content)} chars)")
            return final_content
        else:
            print(f"{Colors.RED}[ERROR] Thread-{thread_id} Final aggregation failed{Colors.RESET}")
            return None

def generate_enhanced_file(country, web_extractor_url="http://localhost:5000", ollama_url="http://localhost:5001", thread_id=0):
    """Generate enhanced taxation file for a country"""
    # Ensure the data directory exists
    data_dir = "scripts/data"
    os.makedirs(data_dir, exist_ok=True)

    filename = f"{data_dir}/taxation_{country}.txt"

    print(f"[PROCESSING] Thread-{thread_id} {country}...")

    # Skip if well-formatted file already exists
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        if content and len(content) > 500 and "Tax Brackets" in content:
            print(f"[SKIP] Thread-{thread_id} Well-formatted file already exists: {filename}")
            return True

    # Step 1: Fetch raw Wikipedia content
    print(f"[FETCH] Thread-{thread_id} Getting Wikipedia content for {country}")
    raw_content = fetch_raw_content(country, web_extractor_url)

    if not raw_content:
        print(f"{Colors.RED}[ERROR] Thread-{thread_id} Could not fetch Wikipedia content for {country}{Colors.RESET}")
        return False

    # Step 2: Format with LLM
    print(f"[FORMAT] Thread-{thread_id} Restructuring content with LLM")
    formatted_content = format_with_llm(country, raw_content, ollama_url, thread_id=thread_id)

    if not formatted_content:
        print(f"{Colors.RED}[ERROR] Thread-{thread_id} LLM formatting failed for {country}{Colors.RESET}")
        return False

    # Step 3: Save formatted content
    try:
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(formatted_content)
        print(f"{Colors.GREEN}[SUCCESS] Thread-{thread_id} Created {filename} ({len(formatted_content)} chars){Colors.RESET}")
        return True
    except Exception as e:
        print(f"{Colors.RED}[ERROR] Thread-{thread_id} Could not save {filename}: {e}{Colors.RESET}")
        return False

def process_existing_txt_files(web_extractor_url="http://localhost:5000", ollama_url="http://localhost:5001", max_workers=1):
    """Process existing txt files from web extractor that start with 'taxation'"""
    print(f"{Colors.CYAN}[PROCESS-EXISTING] Processing existing txt files from web extractor{Colors.RESET}")
    print("=" * 70)

    # Step 1: Get list of available txt files
    print("[STEP 1] Fetching list of available txt files")
    txt_files_result = list_txt_files(web_extractor_url)

    if not txt_files_result or not txt_files_result.get('success'):
        print(f"{Colors.RED}[ERROR] Failed to get txt files list from web extractor{Colors.RESET}")
        return False

    # Step 2: Filter files that start with 'taxation'
    print("\n[STEP 2] Filtering taxation files")
    all_files = txt_files_result.get('files', [])
    taxation_files = [f for f in all_files if f.startswith('taxation')]

    if not taxation_files:
        print(f"{Colors.YELLOW}[WARNING] No taxation files found in web extractor{Colors.RESET}")
        print(f"[INFO] Available files: {', '.join(all_files) if all_files else 'None'}")
        return True

    print(f"[TAXATION-FILES] Found {len(taxation_files)} taxation files to process:")
    for filename in taxation_files:
        file_info = txt_files_result['files_info'].get(filename, {})
        file_size = file_info.get('file_size', 'Unknown')
        print(f"  - {filename} ({file_size:,} bytes)")

    # Step 3: Ensure local data directory exists
    data_dir = "scripts/data"
    os.makedirs(data_dir, exist_ok=True)
    print(f"\n[STEP 3] Data directory ready: {data_dir}")

    # Step 4: Process each taxation file
    print(f"\n[STEP 4] Processing taxation files with LLM")
    print(f"[PARALLEL] Using {max_workers} worker threads")

    success_count = 0
    failed_count = 0
    skipped_count = 0
    lock = threading.Lock()

    def process_single_taxation_file(filename, thread_id):
        """Process a single taxation file"""
        nonlocal success_count, failed_count, skipped_count

        print(f"[PROCESSING] Thread-{thread_id} Starting {filename}")

        # Check if local file already exists and is recent
        local_filename = os.path.join(data_dir, filename)
        if os.path.exists(local_filename):
            try:
                with open(local_filename, 'r', encoding='utf-8') as f:
                    existing_content = f.read().strip()

                # Check if file has substantial content and proper formatting
                if len(existing_content) > 1000 and ("Personal Income Tax:" in existing_content or "Tax Brackets" in existing_content):
                    print(f"[SKIP] Thread-{thread_id} {filename} - Well-formatted file already exists")
                    with lock:
                        skipped_count += 1
                    return
            except Exception:
                pass  # Continue to reprocess if we can't read the file

        # Fetch content from web extractor
        print(f"[FETCH] Thread-{thread_id} Fetching content for {filename}")
        raw_content = fetch_txt_file_content(filename, web_extractor_url)

        if not raw_content:
            print(f"{Colors.RED}[ERROR] Thread-{thread_id} Failed to fetch content for {filename}{Colors.RESET}")
            with lock:
                failed_count += 1
            return

        # Extract country name from filename for LLM processing
        # taxation_germany.txt -> germany -> Germany
        country_name = filename.replace('taxation_', '').replace('.txt', '').replace('_', ' ').title()
        country_key = filename.replace('taxation_', '').replace('.txt', '')

        print(f"[LLM] Thread-{thread_id} Processing {country_name} with LLM")

        # Format with LLM using existing function
        formatted_content = format_with_llm(country_key, raw_content, ollama_url, thread_id=thread_id)

        if not formatted_content:
            print(f"{Colors.RED}[ERROR] Thread-{thread_id} LLM formatting failed for {filename}{Colors.RESET}")
            with lock:
                failed_count += 1
            return

        # Save to local data directory
        try:
            with open(local_filename, 'w', encoding='utf-8') as f:
                f.write(formatted_content)

            print(f"{Colors.GREEN}[SUCCESS] Thread-{thread_id} Saved {filename} to {local_filename} ({len(formatted_content)} chars){Colors.RESET}")
            with lock:
                success_count += 1

        except Exception as e:
            print(f"{Colors.RED}[ERROR] Thread-{thread_id} Failed to save {filename}: {e}{Colors.RESET}")
            with lock:
                failed_count += 1

    # Process files in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_file = {}
        for i, filename in enumerate(taxation_files):
            future = executor.submit(process_single_taxation_file, filename, i + 1)
            future_to_file[future] = filename

        print(f"\n[PARALLEL] Submitted {len(future_to_file)} tasks to thread pool")

        # Collect results as they complete
        for future in concurrent.futures.as_completed(future_to_file):
            filename = future_to_file[future]
            try:
                future.result()  # This will raise any exceptions from the thread
                print(f"[COMPLETED] {filename}")
            except Exception as exc:
                with lock:
                    failed_count += 1
                print(f"{Colors.RED}[ERROR] {filename} generated an exception: {exc}{Colors.RESET}")

    print(f"\n[PARALLEL] All {len(taxation_files)} tasks completed")

    # Summary
    print(f"\n" + "=" * 70)
    print(f"[SUMMARY] Processing Summary:")
    print(f"   {Colors.GREEN}[SUCCESS] Successfully processed: {success_count}{Colors.RESET}")
    print(f"   {Colors.YELLOW}[SKIPPED] Already up-to-date: {skipped_count}{Colors.RESET}")
    print(f"   {Colors.RED}[FAILED] Failed to process: {failed_count}{Colors.RESET}")
    print(f"   [TOTAL] Total taxation files: {len(taxation_files)}")

    if success_count > 0:
        print(f"\n{Colors.GREEN}[SUCCESS] Files saved to: {data_dir}{Colors.RESET}")
        print(f"[NEXT] You can now run: python scripts/tax_data_updater.py --only-with-files")

    return failed_count == 0

def main():
    """Generate enhanced taxation files for all countries"""
    import argparse

    parser = argparse.ArgumentParser(
        description="Enhanced Taxation File Generator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Default mode (generate all files)
  python scripts/generate_enhanced_taxation_files.py

  # List available txt files only
  python scripts/generate_enhanced_taxation_files.py --list-txt-files

  # Process existing taxation files from web extractor
  python scripts/generate_enhanced_taxation_files.py --process-existing
        """
    )

    parser.add_argument(
        "--list-txt-files",
        action="store_true",
        help="List available txt files in web extractor and exit"
    )

    parser.add_argument(
        "--process-existing",
        action="store_true",
        help="Process existing taxation txt files from web extractor and save to scripts/data"
    )

    args = parser.parse_args()

    print("Enhanced Taxation File Generator")
    print("=" * 50)

    # Handle list-only mode
    if args.list_txt_files:
        print("[MODE] List txt files only")
        try:
            print("[API-CHECK] Testing Web Content Extractor")
            web_response = requests.get("http://localhost:5000/health", timeout=5)
            print(f"[API-RESPONSE] HTTP {web_response.status_code} from Web Content Extractor")

            if web_response.status_code == 200:
                print("\n[TXT-FILES-LIST] Retrieving available txt files")
                txt_files_result = list_txt_files("http://localhost:5000")
                if txt_files_result and txt_files_result.get('success'):
                    print(f"\n{Colors.GREEN}[SUCCESS] Found {txt_files_result['count']} txt files{Colors.RESET}")
                else:
                    print(f"{Colors.RED}[ERROR] Failed to retrieve txt files list{Colors.RESET}")
                    return 1
            else:
                print(f"{Colors.RED}[ERROR] Web Content Extractor not available{Colors.RESET}")
                return 1
        except Exception as e:
            print(f"{Colors.RED}[ERROR] Failed to connect to web extractor: {e}{Colors.RESET}")
            return 1

        return 0

    # Handle process-existing mode
    if args.process_existing:
        print("[MODE] Process existing taxation files from web extractor")
        try:
            print("[API-CHECK] Testing required services")
            web_response = requests.get("http://localhost:5000/health", timeout=5)
            print(f"[API-RESPONSE] HTTP {web_response.status_code} from Web Content Extractor")

            ollama_response = requests.get("http://localhost:5001/health", timeout=5)
            print(f"[API-RESPONSE] HTTP {ollama_response.status_code} from Ollama Proxy")

            if web_response.status_code == 200 and ollama_response.status_code == 200:
                print(f"\n{Colors.GREEN}[API-OK] Both services are running{Colors.RESET}")
                print("\n[PROCESS-START] Starting existing file processing")
                success = process_existing_txt_files("http://localhost:5000", "http://localhost:5001")
                return 0 if success else 1
            else:
                print(f"{Colors.RED}[ERROR] Required services not available{Colors.RESET}")
                if web_response.status_code != 200:
                    print(f"{Colors.RED}[ERROR] Web Content Extractor not responding{Colors.RESET}")
                if ollama_response.status_code != 200:
                    print(f"{Colors.RED}[ERROR] Ollama Proxy not responding{Colors.RESET}")
                return 1
        except Exception as e:
            print(f"{Colors.RED}[ERROR] Failed to connect to services: {e}{Colors.RESET}")
            return 1

    # Check services
    print("[API-CHECK] Testing required services")
    try:
        print("[API-CALL] GET http://localhost:5000/health - Web Content Extractor")
        web_response = requests.get("http://localhost:5000/health", timeout=5)
        print(f"[API-RESPONSE] HTTP {web_response.status_code} from Web Content Extractor")

        print("[API-CALL] GET http://localhost:5001/health - Ollama Proxy")
        ollama_response = requests.get("http://localhost:5001/health", timeout=5)
        print(f"[API-RESPONSE] HTTP {ollama_response.status_code} from Ollama Proxy")

        # Check available models
        print("[API-CALL] GET http://localhost:5001/models - Fetching available models")
        models_response = requests.get("http://localhost:5001/models", timeout=10)
        if models_response.status_code == 200:
            models = models_response.json().get('models', [])
            available_models = [model['name'] for model in models]
            print(f"[MODELS] Available: {available_models}")

        # Check txt files in web extractor
        print("\n[TXT-FILES-CHECK] Checking available txt files in web extractor")
        txt_files_result = list_txt_files("http://localhost:5000")
        if txt_files_result and txt_files_result.get('success'):
            app_created_files = [f for f in txt_files_result['files']
                               if txt_files_result['files_info'].get(f, {}).get('created_by_app', False)]
            external_files = [f for f in txt_files_result['files']
                            if not txt_files_result['files_info'].get(f, {}).get('created_by_app', False)]

            if app_created_files:
                print(f"[TXT-FILES] {len(app_created_files)} app-created files available for processing")
            if external_files:
                print(f"[TXT-FILES] {len(external_files)} external files detected")
        else:
            print(f"{Colors.YELLOW}[WARNING] Could not retrieve txt files list (endpoint may not be available){Colors.RESET}")

        print("\n[API-OK] Both services are running")
        print(f"[ENDPOINTS] Will use:")
        print(f"  - Web Content Extractor: http://localhost:5000/extract")
        print(f"  - Web Content Extractor TXT Files: http://localhost:5000/txt-files")
        print(f"  - Web Content Extractor File Content: http://localhost:5000/files/<filename>")
        print(f"  - Ollama Proxy: http://localhost:5001/chat")
    except Exception as e:
        print(f"{Colors.RED}[ERROR] Service check failed: {e}{Colors.RESET}")
        print(f"{Colors.RED}[ERROR] Please ensure both web extractor and Ollama proxy are running{Colors.RESET}")
        return 1

    max_workers = 3  # Conservative number for stability
    print(f"[PARALLEL] Using {max_workers} worker threads for enhanced generation")

    success_count = 0
    failed_count = 0
    lock = threading.Lock()

    # Process countries in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_country = {}
        for i, country in enumerate(COUNTRIES):
            future = executor.submit(generate_enhanced_file, country,
                                   "http://localhost:5000", "http://localhost:5001", i + 1)
            future_to_country[future] = country

        print(f"\n[PARALLEL] Submitted {len(future_to_country)} tasks to thread pool")

        # Collect results as they complete
        for future in concurrent.futures.as_completed(future_to_country):
            country = future_to_country[future]
            try:
                result = future.result()
                with lock:
                    if result:
                        success_count += 1
                        print(f"[COMPLETED] {country} - SUCCESS")
                    else:
                        failed_count += 1
                        print(f"[COMPLETED] {country} - FAILED")
            except Exception as exc:
                with lock:
                    failed_count += 1
                print(f"{Colors.RED}[ERROR] {country} generated an exception: {exc}{Colors.RESET}")

    print(f"\n[PARALLEL] All {len(COUNTRIES)} tasks completed")

    print(f"\n" + "=" * 50)
    print(f"[SUMMARY] Enhanced generation complete!")
    print(f"{Colors.GREEN}[SUCCESS] Successfully generated: {success_count}{Colors.RESET}")
    print(f"[FAILED] Failed to generate: {failed_count}")
    print(f"[TOTAL] Total countries: {len(COUNTRIES)}")

    if success_count > 0:
        print(f"\n[NEXT] Run the tax data updater:")
        print(f"python scripts/tax_data_updater.py")

    return 0 if failed_count == 0 else 1

if __name__ == "__main__":
    exit(main())
