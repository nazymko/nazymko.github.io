#!/usr/bin/env python3
"""
Research taxation information and format it properly
"""

import requests
import concurrent.futures
import threading

def research_country_taxation(country, ollama_url="http://localhost:5001", model="gemma3:12b", thread_id=0):
    """Research and format taxation info for a country using LLM"""

    prompt = f"""
    Please provide comprehensive, current taxation information for {country.replace('_', ' ').title()} in the following structured format:

    Taxation in {country.replace('_', ' ').title()}

    [Write 1-2 sentences describing the overall tax system]

    Personal Income Tax Brackets (2024):
    - [Currency][amount] to [Currency][amount]: [rate]%
    - [Continue for all brackets]
    - [Currency][amount] and above: [rate]%

    Additional Federal/National Taxes:
    - [Tax name]: [rate]% on [description with limits if any]

    Value Added Tax (VAT) / Goods and Services Tax (GST):
    - Standard rate: [rate]%
    - Reduced rate: [rate]% ([what items])
    - Zero rate: [what items]

    [OR if no VAT:]
    No Federal VAT/GST:
    - [Description of how sales tax works instead]

    Tax-free Allowances (2024):
    - [Allowance name]: [Currency][amount] per year

    Additional Information:
    - Tax year runs from [start] to [end]
    - [Any important calculation notes]
    - [Recent major changes]

    Please ensure:
    1. Use the correct currency for the country
    2. Provide 2024 tax rates where available
    3. Include exact numerical brackets and rates
    4. Mention the tax system type (progressive/flat/zero personal tax)
    5. Include social security or equivalent contributions
    6. Be specific about VAT/GST rates and what they apply to

    Source: [Mention official tax authority or reliable source]
    Last updated: 2024
    """

    print(f"[LLM-REQUEST] Thread-{thread_id} POST {ollama_url}/chat - Researching {country}")
    print(f"[LLM-MODEL] Thread-{thread_id} Using model: {model}")
    print(f"[LLM-PROMPT] Thread-{thread_id} Researching taxation information for {country.replace('_', ' ').title()}")
    print(f"[LLM-TIMEOUT] Thread-{thread_id} Request timeout: 90 seconds")

    try:
        request_payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False
        }
        print(f"[LLM-PAYLOAD] Model: {model}, Messages: 1, Stream: False")

        response = requests.post(
            f"{ollama_url}/chat",
            json=request_payload,
            timeout=90
        )

        print(f"[LLM-RESPONSE] Thread-{thread_id} HTTP {response.status_code} from Ollama Proxy")

        if response.status_code == 200:
            llm_response = response.json()
            content = llm_response.get('message', {}).get('content', '')

            print(f"[LLM-OUTPUT] Thread-{thread_id} Received {len(content)} characters from model {model}")

            # Save to file in scripts/data directory
            data_dir = "scripts/data"
            os.makedirs(data_dir, exist_ok=True)
            filename = f"{data_dir}/taxation_{country}.txt"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(content)

            print(f"[FILE-SAVED] Thread-{thread_id} Created {filename} ({len(content)} chars)")
            print(f"[SUCCESS] Thread-{thread_id} Research completed for {country}")
            return True
        else:
            print(f"[ERROR] Thread-{thread_id} LLM request failed for {country} - HTTP {response.status_code}")
            try:
                error_data = response.json()
                print(f"[DEBUG] Thread-{thread_id} Error response: {error_data}")
            except:
                print(f"[DEBUG] Thread-{thread_id} Raw error response: {response.text[:200]}...")
            return False

    except Exception as e:
        print(f"[ERROR] Thread-{thread_id} Failed to research {country}: {e}")
        return False

# Example usage for specific countries
if __name__ == "__main__":
    countries_to_research = [
        "france", "italy", "spain", "netherlands", "sweden",
        "norway", "denmark", "finland", "poland", "switzerland"
    ]

    print("Tax Research and Formatting Tool")
    print("=" * 40)

    # Check Ollama service
    print("[API-CHECK] Testing Ollama Proxy service")
    try:
        print("[API-CALL] GET http://localhost:5001/health")
        response = requests.get("http://localhost:5001/health", timeout=5)
        print(f"[API-RESPONSE] HTTP {response.status_code} from Ollama Proxy")

        # Check available models
        print("[API-CALL] GET http://localhost:5001/models")
        models_response = requests.get("http://localhost:5001/models", timeout=10)
        if models_response.status_code == 200:
            models = models_response.json().get('models', [])
            available_models = [model['name'] for model in models]
            print(f"[MODELS] Available: {available_models}")

        print("[API-OK] Ollama Proxy is running")
        print(f"[ENDPOINTS] Will use: http://localhost:5001/chat")

    except Exception as e:
        print(f"[ERROR] Ollama service check failed: {e}")
        return

    max_workers = 3  # Conservative number for research tasks
    print(f"[PARALLEL] Using {max_workers} worker threads for research")

    success_count = 0
    failed_count = 0
    lock = threading.Lock()

    # Process countries in parallel
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all tasks
        future_to_country = {}
        for i, country in enumerate(countries_to_research):
            future = executor.submit(research_country_taxation, country,
                                   "http://localhost:5001", "gemma3:12b", i + 1)
            future_to_country[future] = country

        print(f"\n[PARALLEL] Submitted {len(future_to_country)} research tasks to thread pool")

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
                print(f"[ERROR] {country} generated an exception: {exc}")

    print(f"\n[PARALLEL] All {len(countries_to_research)} research tasks completed")

    print(f"\n[SUMMARY] Research finished!")
    print(f"[SUCCESS] Successfully researched: {success_count}")
    print(f"[FAILED] Failed to research: {failed_count}")
    print("You can now run: python scripts/tax_data_updater.py")
