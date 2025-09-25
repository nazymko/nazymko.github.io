#!/usr/bin/env python3
"""
Tax Data Updater Script

This script:
1. Reads the current taxData.js file
2. Reads content from taxation_*.txt files for matching countries
3. Uses local LLM to analyze content and extract tax details
4. Generates taxData2.js with updated and correct taxation data
5. Adds comments showing what was added/removed compared to original

Requirements:
- Web Content Extractor API running on localhost:5000
- Ollama Proxy API running on localhost:5001
- taxation_*.txt files in the scripts/data/ directory
"""

import os
import re
import json
import requests
import time
import concurrent.futures
import threading
import uuid
import logging
import argparse
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict

# Import LLM provider system
from llm_providers import (
    LLMProviderManager,
    LLMRequest,
    LLMResponse,
    OllamaProvider,
    OpenAIProvider,
    create_default_manager
)


@dataclass
class TaxBracket:
    min: int
    max: Optional[int]
    rate: float
    description: Optional[str] = None


@dataclass
class VATInfo:
    hasVAT: bool
    standard: Optional[float] = None
    reduced: Optional[List[float]] = None
    description: Optional[str] = None
    notes: Optional[str] = None


@dataclass
class CountryTaxData:
    name: str
    currency: str
    system: str  # progressive, flat, zero_personal
    countryCode: str
    coordinates: List[float]
    brackets: List[TaxBracket]
    vat: Optional[VATInfo] = None
    special_taxes: Optional[List[Dict]] = None
    notes: Optional[str] = None


class TraceLogger:
    """Handles trace-based logging for detailed request tracking"""

    def __init__(self, logs_dir: str = "logs"):
        self.logs_dir = logs_dir
        self.ensure_logs_directory()

    def ensure_logs_directory(self):
        """Ensure logs directory exists"""
        if not os.path.exists(self.logs_dir):
            os.makedirs(self.logs_dir)

    def generate_trace_id(self) -> str:
        """Generate a unique trace ID for request tracking"""
        return f"trace_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"

    def log_request(self, trace_id: str, country_key: str, thread_id: int,
                   request_payload: Dict, request_url: str, model_name: str):
        """Log request details to trace-specific file"""
        log_filename = f"{self.logs_dir}/{trace_id}_request.log"

        # Create a copy of payload for logging with content length info
        payload_for_logging = request_payload.copy()

        # Add content statistics without truncating
        if "messages" in payload_for_logging and len(payload_for_logging["messages"]) > 0:
            content = payload_for_logging["messages"][0].get("content", "")
            content_length = len(content)

            # Add metadata about content size
            payload_for_logging["content_metadata"] = {
                "content_length_chars": content_length,
                "content_lines": content.count('\n') + 1 if content else 0,
                "is_truncated": False,
                "full_content_included": True
            }

        log_data = {
            "trace_id": trace_id,
            "timestamp": datetime.now().isoformat(),
            "country": country_key,
            "thread_id": thread_id,
            "request_url": request_url,
            "model_name": model_name,
            "request_payload": payload_for_logging
        }

        try:
            with open(log_filename, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, indent=2, ensure_ascii=False)
            print(f"[TRACE-LOG] {trace_id} Request logged to {log_filename}")
        except Exception as e:
            print(f"[TRACE-ERROR] {trace_id} Failed to log request: {e}")

    def log_response(self, trace_id: str, country_key: str, thread_id: int,
                    response_status: int, response_content: str,
                    processing_time: float, validation_result: bool = None,
                    extracted_data: Dict = None, error: str = None):
        """Log response details to trace-specific file"""
        log_filename = f"{self.logs_dir}/{trace_id}_response.log"

        log_data = {
            "trace_id": trace_id,
            "timestamp": datetime.now().isoformat(),
            "country": country_key,
            "thread_id": thread_id,
            "response_status": response_status,
            "processing_time_seconds": processing_time,
            "validation_result": validation_result,
            "response_content": response_content,
            "extracted_data": extracted_data,
            "error": error
        }

        try:
            with open(log_filename, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, indent=2, ensure_ascii=False)
            print(f"[TRACE-LOG] {trace_id} Response logged to {log_filename}")
        except Exception as e:
            print(f"[TRACE-ERROR] {trace_id} Failed to log response: {e}")

    def log_summary(self, trace_id: str, country_key: str, thread_id: int,
                   success: bool, final_data: Dict = None, fallback_used: bool = False):
        """Log processing summary to trace-specific file"""
        log_filename = f"{self.logs_dir}/{trace_id}_summary.log"

        log_data = {
            "trace_id": trace_id,
            "timestamp": datetime.now().isoformat(),
            "country": country_key,
            "thread_id": thread_id,
            "success": success,
            "fallback_used": fallback_used,
            "final_data": final_data
        }

        try:
            with open(log_filename, 'w', encoding='utf-8') as f:
                json.dump(log_data, f, indent=2, ensure_ascii=False)
            print(f"[TRACE-LOG] {trace_id} Summary logged to {log_filename}")
        except Exception as e:
            print(f"[TRACE-ERROR] {trace_id} Failed to log summary: {e}")

    def log_streaming_chunk(self, trace_id: str, country_key: str, thread_id: int,
                           chunk_number: int, chunk_content: str, timestamp: str = None):
        """Log individual streaming response chunks to trace-specific file"""
        log_filename = f"{self.logs_dir}/{trace_id}_stream.log"

        if timestamp is None:
            timestamp = datetime.now().isoformat()

        chunk_data = {
            "trace_id": trace_id,
            "timestamp": timestamp,
            "country": country_key,
            "thread_id": thread_id,
            "chunk_number": chunk_number,
            "chunk_content": chunk_content,
            "chunk_length": len(chunk_content)
        }

        try:
            # Append to streaming log file
            with open(log_filename, 'a', encoding='utf-8') as f:
                json.dump(chunk_data, f, ensure_ascii=False)
                f.write('\n')  # Add newline for readability

            # Also print to console for real-time monitoring
            print(f"[STREAM-CHUNK] {trace_id} Thread-{thread_id} Chunk-{chunk_number}: {chunk_content.strip()}")

        except Exception as e:
            print(f"[TRACE-ERROR] {trace_id} Failed to log streaming chunk: {e}")

    def log_streaming_complete(self, trace_id: str, country_key: str, thread_id: int,
                              total_chunks: int, total_content: str, processing_time: float):
        """Log streaming completion summary"""
        log_filename = f"{self.logs_dir}/{trace_id}_stream_summary.log"

        summary_data = {
            "trace_id": trace_id,
            "timestamp": datetime.now().isoformat(),
            "country": country_key,
            "thread_id": thread_id,
            "total_chunks": total_chunks,
            "total_content_length": len(total_content),
            "processing_time_seconds": processing_time,
            "complete_content": total_content
        }

        try:
            with open(log_filename, 'w', encoding='utf-8') as f:
                json.dump(summary_data, f, indent=2, ensure_ascii=False)
            print(f"[STREAM-COMPLETE] {trace_id} Thread-{thread_id} Streaming completed: {total_chunks} chunks, {len(total_content)} chars in {processing_time:.2f}s")
        except Exception as e:
            print(f"[TRACE-ERROR] {trace_id} Failed to log streaming summary: {e}")


class TaxDataProcessor:
    """Processes tax data using multiple LLM providers (Ollama, OpenAI, etc.)"""

    def __init__(self,
                 web_extractor_url: str = "http://localhost:5000",
                 ollama_proxy_url: str = "http://localhost:5001",
                 model_name: str = "gemma3:12b",
                 max_workers: int = 4,
                 enable_parallel: bool = True,
                 enable_streaming: bool = False,
                 provider: str = "auto",
                 openai_api_key: Optional[str] = None,
                 only_with_files: bool = False):
        self.web_extractor_url = web_extractor_url
        self.ollama_proxy_url = ollama_proxy_url
        self.model_name = model_name
        self.max_workers = max_workers if enable_parallel else 1
        self.enable_parallel = enable_parallel
        self.enable_streaming = enable_streaming
        self.provider_name = provider
        self.openai_api_key = openai_api_key
        self.only_with_files = only_with_files
        self.original_data = {}
        self.updated_data = {}
        self.changes_log = {}
        self._lock = threading.Lock()  # For thread-safe operations
        self.trace_logger = TraceLogger()  # Initialize trace logger

        # Initialize LLM provider manager
        self.llm_manager = self._initialize_llm_providers()
        self.llm_provider = self._select_llm_provider()

        # Validate provider initialization
        if not self.llm_provider:
            print(f"[ERROR] Failed to initialize LLM provider '{self.provider_name}'")
            print(f"[ERROR] Available providers: {self.llm_manager.list_providers()}")
            if self.provider_name == "openai":
                print(f"[ERROR] Check your OpenAI API key in open-api.key file")
            elif self.provider_name == "ollama":
                print(f"[ERROR] Check that Ollama is running at {self.ollama_proxy_url}")
            raise RuntimeError(f"Failed to initialize LLM provider: {self.provider_name}")

        # Log configuration
        if not enable_parallel:
            print(f"[CONFIG] Multi-threading DISABLED - Processing countries sequentially")
        else:
            print(f"[CONFIG] Multi-threading ENABLED - Using {self.max_workers} worker threads")

        if enable_streaming:
            print(f"[CONFIG] Streaming mode ENABLED - Real-time LLM response tracing")
        else:
            print(f"[CONFIG] Streaming mode DISABLED - Standard request/response mode")

        print(f"[CONFIG] LLM Provider: {self.llm_provider.provider_name}")
        print(f"[CONFIG] Model: {self.model_name}")

    def _initialize_llm_providers(self) -> LLMProviderManager:
        """Initialize LLM provider manager with available providers"""
        manager = LLMProviderManager()

        # Always add Ollama provider
        ollama_provider = OllamaProvider(base_url=self.ollama_proxy_url)
        manager.add_provider(ollama_provider, "ollama")

        # Only add OpenAI provider if it might be needed
        if self._should_initialize_openai():
            try:
                openai_provider = OpenAIProvider(api_key=self.openai_api_key)
                manager.add_provider(openai_provider, "openai")
                print(f"[PROVIDER] OpenAI provider initialized")
            except Exception as e:
                print(f"[WARNING] Could not initialize OpenAI provider: {e}")

        return manager

    def _should_initialize_openai(self) -> bool:
        """Determine if OpenAI provider should be initialized"""
        # Initialize OpenAI if explicitly requested
        if self.provider_name == "openai":
            return True

        # Initialize OpenAI if auto mode and model looks like OpenAI model
        if self.provider_name == "auto" and self.model_name.startswith("gpt-"):
            return True

        # Don't initialize otherwise
        return False

    def _select_llm_provider(self):
        """Select appropriate LLM provider based on configuration"""
        if self.provider_name == "auto":
            # Auto-select based on model name and availability
            if self.model_name.startswith("gpt-") and "openai" in self.llm_manager.list_providers():
                provider = self.llm_manager.get_provider("openai")
                if provider and provider.is_available():
                    print(f"[PROVIDER] Auto-selected OpenAI for model {self.model_name}")
                    return provider

            # Fallback to Ollama
            provider = self.llm_manager.get_provider("ollama")
            if provider and provider.is_available():
                print(f"[PROVIDER] Auto-selected Ollama for model {self.model_name}")
                return provider

            print(f"[ERROR] No LLM providers available")
            return None

        elif self.provider_name == "openai":
            # Handle explicit OpenAI request
            if "openai" not in self.llm_manager.list_providers():
                print(f"[ERROR] OpenAI provider requested but not initialized (missing API key?)")
                return None
            provider = self.llm_manager.get_provider("openai")
            if provider:
                print(f"[DEBUG] OpenAI provider found, checking availability...")
                if provider.is_available():
                    print(f"[PROVIDER] Selected OpenAI provider")
                    return provider
                else:
                    print(f"[ERROR] OpenAI provider not available (API key or connection issue)")
                    return None
            else:
                print(f"[ERROR] OpenAI provider not found in manager")
                return None

        elif self.provider_name == "ollama":
            # Handle explicit Ollama request
            provider = self.llm_manager.get_provider("ollama")
            if provider and provider.is_available():
                print(f"[PROVIDER] Selected Ollama provider")
                return provider
            else:
                print(f"[ERROR] Ollama provider not available")
                return None

        else:
            print(f"[ERROR] Unknown provider: {self.provider_name}")
            return None

    def check_services(self) -> bool:
        """Check if required services are running"""
        try:
            # Check web extractor
            print(f"[API-CHECK] Testing Web Content Extractor at {self.web_extractor_url}/health")
            response = requests.get(f"{self.web_extractor_url}/health", timeout=5)
            if response.status_code != 200:
                print(f"[ERROR] Web extractor service not available at {self.web_extractor_url}")
                return False
            print(f"[API-OK] Web Content Extractor is responding")

            # Only check Ollama if using Ollama provider
            if self.llm_provider and self.llm_provider.provider_name == "ollama":
                # Check Ollama proxy
                print(f"[API-CHECK] Testing Ollama Proxy at {self.ollama_proxy_url}/health")
                response = requests.get(f"{self.ollama_proxy_url}/health", timeout=5)
                if response.status_code != 200:
                    print(f"[ERROR] Ollama proxy service not available at {self.ollama_proxy_url}")
                    return False
                print(f"[API-OK] Ollama Proxy is responding")

                # Check model availability
                print(f"[API-CALL] GET {self.ollama_proxy_url}/models - Fetching available models")
                response = requests.get(f"{self.ollama_proxy_url}/models", timeout=10)
                if response.status_code == 200:
                    models = response.json().get('models', [])
                    available_models = [model['name'] for model in models]
                    print(f"[MODELS] Available: {available_models}")

                    if self.model_name not in available_models:
                        print(f"[WARNING] Model '{self.model_name}' not found. Available models: {available_models}")
                        if available_models:
                            self.model_name = available_models[0]
                            print(f"[MODEL-SELECTED] Using model: {self.model_name}")
                        else:
                            print("[ERROR] No models available in Ollama")
                            return False
                    else:
                        print(f"[MODEL-CONFIRMED] Using requested model: {self.model_name}")
            elif self.llm_provider and self.llm_provider.provider_name == "openai":
                # For OpenAI, just verify the provider is working
                print(f"[API-CHECK] Testing OpenAI provider availability")
                if not self.llm_provider.is_available():
                    print(f"[ERROR] OpenAI provider not available (check API key)")
                    return False
                print(f"[API-OK] OpenAI provider is responding")
                print(f"[MODEL-CONFIRMED] Using OpenAI model: {self.model_name}")
            else:
                print(f"[MODEL-INFO] Using {self.llm_provider.provider_name if self.llm_provider else 'unknown'} model: {self.model_name}")

            print("[SUCCESS] All services are running and model is available")
            return True

        except requests.exceptions.RequestException as e:
            print(f"[ERROR] Service check failed: {e}")
            return False

    def parse_taxdata_js(self, file_path: str = "js/taxData.js") -> Dict[str, Any]:
        """Parse the existing taxData.js file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extract the taxData object using regex
            # Find the export const taxData = { ... } block
            pattern = r'export\s+const\s+taxData\s*=\s*(\{.*?\});'
            match = re.search(pattern, content, re.DOTALL)

            if not match:
                raise ValueError("Could not find taxData export in file")

            tax_data_str = match.group(1)

            # Convert JavaScript object to Python dict
            # This is a simplified conversion - may need refinement for complex cases
            tax_data_str = self._js_to_python_dict(tax_data_str)

            # Parse as JSON (after converting JS to valid JSON)
            self.original_data = eval(tax_data_str)  # Note: eval is dangerous, consider using ast.literal_eval

            print(f"[INFO] Loaded {len(self.original_data)} countries from taxData.js")
            return self.original_data

        except Exception as e:
            print(f"[ERROR] Error parsing taxData.js: {e}")
            return {}

    def _js_to_python_dict(self, js_str: str) -> str:
        """Convert JavaScript object notation to Python dict notation"""
        # Replace null with None
        js_str = re.sub(r'\bnull\b', 'None', js_str)

        # Replace true/false with True/False
        js_str = re.sub(r'\btrue\b', 'True', js_str)
        js_str = re.sub(r'\bfalse\b', 'False', js_str)

        # Handle unquoted object keys
        js_str = re.sub(r'(\w+):', r'"\1":', js_str)

        return js_str

    def get_country_key_mapping(self) -> Dict[str, str]:
        """Create mapping between country names and file names"""
        country_mapping = {}

        for key, data in self.original_data.items():
            country_name = data.get('name', '').lower()
            # Convert country name to filename format
            filename = f"scripts/data/taxation_{country_name.replace(' ', '_').replace('-', '_')}.txt"
            country_mapping[key] = filename

        # Add specific mappings for countries with different naming
        special_mappings = {
            'united_states': 'scripts/data/taxation_united_states.txt',
            'united_kingdom': 'scripts/data/taxation_united_kingdom.txt',
            'united_arab_emirates': 'scripts/data/taxation_united_arab_emirates.txt',
            'south_korea': 'scripts/data/taxation_south_korea.txt',
            'south_africa': 'scripts/data/taxation_south_africa.txt',
            'hong_kong': 'scripts/data/taxation_hong_kong.txt',
            'north_korea': 'scripts/data/taxation_north_korea.txt',
            'saudi_arabia': 'scripts/data/taxation_saudi_arabia.txt',
            'bosnia_and_herzegovina': 'scripts/data/taxation_bosnia_and_herzegovina.txt',
            'czech_republic': 'scripts/data/taxation_czech_republic.txt'
        }

        country_mapping.update(special_mappings)
        return country_mapping

    def check_existing_taxation_files(self, country_mapping: Dict[str, str]) -> Tuple[Dict[str, str], Dict[str, str]]:
        """Check which taxation files exist and provide summary"""
        existing_files = {}
        missing_files = {}

        print(f"\n[FILE-CHECK] Checking taxation files in scripts/data/ directory...")

        for country_key, filename in country_mapping.items():
            if os.path.exists(filename):
                # Check file size and basic content
                try:
                    file_size = os.path.getsize(filename)
                    with open(filename, 'r', encoding='utf-8') as f:
                        content = f.read().strip()

                    if content and len(content) > 100:  # Basic content check
                        existing_files[country_key] = filename
                        print(f"[FILE-EXISTS] OK {country_key} -> {filename} ({file_size:,} bytes)")
                    else:
                        missing_files[country_key] = filename
                        print(f"[FILE-EMPTY] X {country_key} -> {filename} (empty or too small: {file_size} bytes)")
                except Exception as e:
                    missing_files[country_key] = filename
                    print(f"[FILE-ERROR] X {country_key} -> {filename} (read error: {e})")
            else:
                missing_files[country_key] = filename
                print(f"[FILE-MISSING] X {country_key} -> {filename} (not found)")

        # Summary
        print(f"\n[FILE-SUMMARY] Taxation File Status:")
        print(f"   [FOUND] Files with content: {len(existing_files)}")
        print(f"   [MISSING] Files missing/empty: {len(missing_files)}")
        print(f"   [TOTAL] Total countries: {len(country_mapping)}")

        if existing_files:
            print(f"\n[WILL-PROCESS] Countries with taxation files ({len(existing_files)}):")
            for country_key in sorted(existing_files.keys()):
                print(f"   - {country_key}")

        if missing_files:
            print(f"\n[WILL-SKIP] Countries without files (will use original data) ({len(missing_files)}):")
            for country_key in sorted(missing_files.keys()):
                print(f"   - {country_key}")

        return existing_files, missing_files

    def read_taxation_file(self, filename: str) -> Optional[str]:
        """Read content from a taxation file"""
        if not os.path.exists(filename):
            print(f"[WARNING] File not found: {filename}")
            return None

        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read().strip()

            if not content:
                print(f"[WARNING] File is empty: {filename}")
                return None

            print(f"[INFO] Read {len(content)} characters from {filename}")
            return content

        except Exception as e:
            print(f"[ERROR] Error reading {filename}: {e}")
            return None

    def validate_structure(self, data: Dict, country_key: str, thread_id: int = 0, trace_id: str = None) -> bool:
        """Validate that extracted data follows the required structure"""
        try:
            # Required fields
            required_fields = ['name', 'currency', 'system', 'countryCode', 'coordinates', 'brackets']
            trace_prefix = f"{trace_id} " if trace_id else ""
            for field in required_fields:
                if field not in data:
                    print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Missing required field '{field}' for {country_key}")
                    return False

            # Validate system values
            valid_systems = ['progressive', 'flat', 'zero_personal']
            if data['system'] not in valid_systems:
                print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Invalid system '{data['system']}' for {country_key}. Must be one of: {valid_systems}")
                return False

            # Validate coordinates
            if not isinstance(data['coordinates'], list) or len(data['coordinates']) != 2:
                print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Invalid coordinates format for {country_key}. Must be [lat, lng]")
                return False

            # Validate brackets
            if not isinstance(data['brackets'], list) or len(data['brackets']) == 0:
                print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Invalid brackets format for {country_key}. Must be non-empty array")
                return False

            for i, bracket in enumerate(data['brackets']):
                if not isinstance(bracket, dict):
                    print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Bracket {i} is not an object for {country_key}")
                    return False

                required_bracket_fields = ['min', 'max', 'rate']
                for field in required_bracket_fields:
                    if field not in bracket:
                        print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Bracket {i} missing '{field}' for {country_key}")
                        return False

                # Validate types
                if not isinstance(bracket['min'], (int, float)):
                    print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Bracket {i} 'min' must be a number for {country_key}")
                    return False

                if bracket['max'] is not None and not isinstance(bracket['max'], (int, float)):
                    print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Bracket {i} 'max' must be a number or null for {country_key}")
                    return False

                if not isinstance(bracket['rate'], (int, float)):
                    print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Bracket {i} 'rate' must be a number for {country_key}")
                    return False

            # Validate VAT structure if present
            if 'vat' in data and data['vat']:
                vat = data['vat']
                if not isinstance(vat, dict):
                    print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} VAT must be an object for {country_key}")
                    return False

                if 'hasVAT' not in vat or not isinstance(vat['hasVAT'], bool):
                    print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} VAT missing or invalid 'hasVAT' boolean for {country_key}")
                    return False

            # Validate special_taxes structure if present
            if 'special_taxes' in data and data['special_taxes']:
                if not isinstance(data['special_taxes'], list):
                    print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} special_taxes must be an array for {country_key}")
                    return False

                for i, tax in enumerate(data['special_taxes']):
                    if not isinstance(tax, dict):
                        print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Special tax {i} is not an object for {country_key}")
                        return False

                    required_tax_fields = ['type', 'target', 'rate', 'description']
                    for field in required_tax_fields:
                        if field not in tax:
                            print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Special tax {i} missing '{field}' for {country_key}")
                            return False

            print(f"[VALIDATION-SUCCESS] {trace_prefix}Thread-{thread_id} Structure validation passed for {country_key}")
            return True

        except Exception as e:
            print(f"[VALIDATION-ERROR] {trace_prefix}Thread-{thread_id} Validation failed for {country_key}: {e}")
            return False

    def _handle_streaming_response(self, trace_id: str, country_key: str, thread_id: int,
                                  request_url: str, request_payload: Dict, start_time: float) -> Optional[str]:
        """Handle streaming LLM response with real-time tracing"""
        try:
            response = requests.post(
                request_url,
                json=request_payload,
                timeout=300,
                stream=True  # Enable streaming
            )

            if response.status_code != 200:
                error_msg = f"Streaming LLM request failed for {country_key}: {response.status_code}"
                print(f"[ERROR] {trace_id} Thread-{thread_id} {error_msg}")
                processing_time = time.time() - start_time

                # Log error response
                self.trace_logger.log_response(
                    trace_id=trace_id,
                    country_key=country_key,
                    thread_id=thread_id,
                    response_status=response.status_code,
                    response_content=response.text,
                    processing_time=processing_time,
                    error=error_msg
                )

                # Log failure summary
                self.trace_logger.log_summary(
                    trace_id=trace_id,
                    country_key=country_key,
                    thread_id=thread_id,
                    success=False,
                    fallback_used=False
                )
                return None

            print(f"[STREAM-START] {trace_id} Thread-{thread_id} Starting streaming response from {self.ollama_proxy_url}")

            # Collect streaming response
            complete_content = ""
            chunk_number = 0

            for line in response.iter_lines(decode_unicode=True):
                if line and line.strip():
                    try:
                        # Parse each streaming response line
                        chunk_data = json.loads(line)
                        chunk_content = chunk_data.get('message', {}).get('content', '')

                        if chunk_content:
                            chunk_number += 1
                            complete_content += chunk_content

                            # Log streaming chunk in real-time
                            self.trace_logger.log_streaming_chunk(
                                trace_id=trace_id,
                                country_key=country_key,
                                thread_id=thread_id,
                                chunk_number=chunk_number,
                                chunk_content=chunk_content
                            )

                    except json.JSONDecodeError:
                        # Skip malformed JSON lines
                        continue

            processing_time = time.time() - start_time

            # Log streaming completion
            self.trace_logger.log_streaming_complete(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                total_chunks=chunk_number,
                total_content=complete_content,
                processing_time=processing_time
            )

            print(f"[LLM-RESPONSE] {trace_id} Thread-{thread_id} HTTP {response.status_code} STREAMING from {self.ollama_proxy_url} (took {processing_time:.2f}s)")

            return complete_content

        except requests.exceptions.RequestException as e:
            processing_time = time.time() - start_time
            error_msg = f"Streaming request error for {country_key}: {e}"
            print(f"[ERROR] {trace_id} Thread-{thread_id} {error_msg}")

            # Log request error
            self.trace_logger.log_response(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                response_status=0,
                response_content="N/A",
                processing_time=processing_time,
                error=error_msg
            )

            # Log failure summary
            self.trace_logger.log_summary(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                success=False,
                fallback_used=False
            )
            return None

        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = f"Unexpected streaming error for {country_key}: {e}"
            print(f"[ERROR] {trace_id} Thread-{thread_id} {error_msg}")

            # Log unexpected error
            self.trace_logger.log_response(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                response_status=0,
                response_content="N/A",
                processing_time=processing_time,
                error=error_msg
            )

            # Log failure summary
            self.trace_logger.log_summary(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                success=False,
                fallback_used=False
            )
            return None

    def analyze_with_llm(self, country_key: str, country_data: Dict, tax_content: str, thread_id: int = 0) -> Optional[Dict]:
        """Analyze tax content with LLM and extract structured data"""

        # Generate unique trace ID for this request
        trace_id = self.trace_logger.generate_trace_id()
        start_time = time.time()

        print(f"[TRACE-START] {trace_id} Thread-{thread_id} Starting LLM analysis for {country_key}")

        prompt = f"""
        Analyze the following taxation information for {country_data.get('name', 'Unknown')} and extract structured tax data.

        Current data in system:
        - Currency: {country_data.get('currency', 'Unknown')}
        - Tax System: {country_data.get('system', 'Unknown')}
        - Current Tax Brackets: {json.dumps(country_data.get('brackets', []), indent=2)}
        - Current VAT: {json.dumps(country_data.get('vat', {}), indent=2)}

        Tax Information Content:
        {tax_content}

        CRITICAL: You must follow the EXACT JSON structure format used in the original taxData.js file.

        REQUIRED JSON STRUCTURE - Follow this precisely:
        {{
            "name": "Country Name",
            "currency": "CUR",
            "system": "progressive|flat|zero_personal",
            "countryCode": "XX",
            "coordinates": [lat, lng],
            "brackets": [
                {{"min": 0, "max": 50000, "rate": 10, "description": "optional description"}},
                {{"min": 50001, "max": null, "rate": 25}}
            ],
            "vat": {{
                "hasVAT": true,
                "standard": 20.0,
                "reduced": [5.0],
                "description": "Standard 20.0%",
                "notes": "optional notes"
            }},
            "special_taxes": [
                {{"type": "social_security", "target": "gross", "rate": 5, "description": "Social security contribution"}},
                {{"type": "military_levy", "target": "gross", "rate": 5, "description": "Additional 5% military levy"}}
            ],
            "notes": "Any additional important information about tax calculation"
        }}

        EXAMPLE - Ukraine structure to follow exactly:
        {{
            "name": "Ukraine",
            "currency": "UAH",
            "system": "flat",
            "countryCode": "UA",
            "coordinates": [50.4501, 30.5234],
            "brackets": [{{"min": 0, "max": null, "rate": 18}}],
            "special_taxes": [
                {{"type": "military_levy", "target": "gross", "rate": 5, "description": "Additional 5% military levy on all income"}},
                {{"type": "united_social_tax", "target": "gross", "rate": 22, "description": "22% united social tax on gross income for employees"}}
            ],
            "vat": {{
                "hasVAT": true,
                "standard": 20.0,
                "description": "Standard 20.0%"
            }}
        }}

        STRICT FORMATTING REQUIREMENTS:
        1. Use EXACT field names: "name", "currency", "system", "countryCode", "coordinates", "brackets", "vat", "special_taxes", "notes"
        2. Field order must match: name, currency, system, countryCode, coordinates, brackets, [special_taxes if exists], vat, [notes if exists]
        3. "brackets" array: Each object must have "min", "max" (or null), "rate" (number), optional "description"
        4. "vat" object: Must have "hasVAT" (boolean), "standard" (number or null), optional "reduced" (array), "description", "notes"
        5. "special_taxes" array: Each object must have "type", "target", "rate" (number), "description"
        6. "coordinates" must be array of two numbers: [latitude, longitude]
        7. Use exact current coordinates: {country_data.get('coordinates', [0, 0])}
        8. Use exact current countryCode: "{country_data.get('countryCode', 'XX')}"

        CRITICAL INSTRUCTIONS:
        1. Extract exact tax rates and brackets from the content
        2. Use "progressive" for multiple tax brackets, "flat" for single rate, "zero_personal" for no income tax
        3. Include VAT/GST information if available - always include hasVAT field
        4. Include any special taxes like social security, military levy, etc. in special_taxes array
        5. Return ONLY valid JSON, no other text or formatting
        6. If unsure about a value, use the current system value as fallback
        7. Maintain exact structure and field names from the example
        8. Numbers should be numeric values, not strings
        9. Booleans should be true/false, not strings
        """

        try:
            if not self.llm_provider:
                error_msg = f"No LLM provider available for {country_key}"
                print(f"[ERROR] {trace_id} Thread-{thread_id} {error_msg}")
                return None

            # Log the LLM request details
            print(f"[LLM-REQUEST] {trace_id} Thread-{thread_id} Using {self.llm_provider.provider_name} provider")
            print(f"[LLM-MODEL] {trace_id} Thread-{thread_id} Using model: {self.model_name}")
            print(f"[LLM-PROMPT] {trace_id} Thread-{thread_id} Analyzing {len(tax_content)} characters of taxation content for {country_key}")
            print(f"[LLM-CONTENT-SIZE] {trace_id} Thread-{thread_id} Full content included in request (no truncation)")
            print(f"[LLM-TIMEOUT] {trace_id} Thread-{thread_id} Request timeout: 300 seconds")
            if self.enable_streaming:
                print(f"[LLM-STREAMING] {trace_id} Thread-{thread_id} Streaming mode enabled - real-time response tracing")

            # Prepare LLM request (skip temperature for models that don't support it)
            request_params = {
                "prompt": prompt,
                "model": self.model_name,
                "stream": self.enable_streaming
            }

            # Only add temperature for models that support it
            if not (self.llm_provider.provider_name == "openai" and self.model_name.startswith("gpt-4o")):
                request_params["temperature"] = 0.3  # Lower temperature for more consistent JSON output

            llm_request = LLMRequest(**request_params)

            # Log request to trace file
            self.trace_logger.log_request(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                request_payload={
                    "model": self.model_name,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": self.enable_streaming,
                    "provider": self.llm_provider.provider_name
                },
                request_url=f"{self.llm_provider.provider_name}://{self.model_name}",
                model_name=self.model_name
            )

            # Generate response using the provider
            llm_response: LLMResponse = self.llm_provider.generate(llm_request)
            processing_time = llm_response.processing_time

            if not llm_response.success:
                error_msg = f"LLM request failed for {country_key}: {llm_response.error}"
                print(f"[ERROR] {trace_id} Thread-{thread_id} {error_msg}")

                # Log error response
                self.trace_logger.log_response(
                    trace_id=trace_id,
                    country_key=country_key,
                    thread_id=thread_id,
                    response_status=0,
                    response_content=llm_response.error or "Unknown error",
                    processing_time=processing_time,
                    error=error_msg
                )

                # Log failure summary
                self.trace_logger.log_summary(
                    trace_id=trace_id,
                    country_key=country_key,
                    thread_id=thread_id,
                    success=False,
                    fallback_used=False
                )
                return None

            content = llm_response.content
            print(f"[LLM-RESPONSE] {trace_id} Thread-{thread_id} {self.llm_provider.provider_name} provider responded (took {processing_time:.2f}s)")
            print(f"[LLM-OUTPUT] {trace_id} Thread-{thread_id} Received {len(content)} characters from model {self.model_name}")

            # Log token usage if available (OpenAI)
            if llm_response.token_usage:
                print(f"[LLM-TOKENS] {trace_id} Thread-{thread_id} Tokens: {llm_response.token_usage['total_tokens']} total ({llm_response.token_usage['prompt_tokens']} prompt + {llm_response.token_usage['completion_tokens']} completion)")

            # Extract JSON from response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if not json_match:
                error_msg = f"No JSON found in LLM response for {country_key}"
                print(f"[ERROR] {trace_id} Thread-{thread_id} {error_msg}")
                print(f"[DEBUG] {trace_id} Thread-{thread_id} LLM raw response: {content[:500]}...")

                # Log JSON parsing error
                self.trace_logger.log_response(
                    trace_id=trace_id,
                    country_key=country_key,
                    thread_id=thread_id,
                    response_status=200,  # Provider succeeded but JSON parsing failed
                    response_content=content,
                    processing_time=processing_time,
                    error=error_msg
                )

                # Log failure summary
                self.trace_logger.log_summary(
                    trace_id=trace_id,
                    country_key=country_key,
                    thread_id=thread_id,
                    success=False,
                    fallback_used=False
                )
                return None

            json_str = json_match.group(0)
            extracted_data = json.loads(json_str)

            # Validate the structure matches requirements
            validation_result = self.validate_structure(extracted_data, country_key, thread_id, trace_id)

            # Log successful response with validation result
            self.trace_logger.log_response(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                response_status=200,  # Provider succeeded
                response_content=content,
                processing_time=processing_time,
                validation_result=validation_result,
                extracted_data=extracted_data if validation_result else None
            )

            if not validation_result:
                print(f"[WARNING] {trace_id} Thread-{thread_id} Structure validation failed for {country_key}, using original data")
                fallback_data = self.original_data.get(country_key)

                # Log fallback summary
                self.trace_logger.log_summary(
                    trace_id=trace_id,
                    country_key=country_key,
                    thread_id=thread_id,
                    success=True,
                    final_data=fallback_data,
                    fallback_used=True
                )
                return fallback_data

            print(f"[SUCCESS] {trace_id} Thread-{thread_id} Successfully analyzed {country_key} with model {self.model_name}")
            print(f"[DATA-EXTRACTED] {trace_id} Thread-{thread_id} Tax system: {extracted_data.get('system')}, "
                  f"Brackets: {len(extracted_data.get('brackets', []))}, "
                  f"VAT: {extracted_data.get('vat', {}).get('standard', 'N/A')}")

            # Log success summary
            self.trace_logger.log_summary(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                success=True,
                final_data=extracted_data,
                fallback_used=False
            )

            return extracted_data

        except json.JSONDecodeError as e:
            processing_time = time.time() - start_time
            error_msg = f"Invalid JSON from LLM for {country_key}: {e}"
            print(f"[ERROR] {trace_id} Thread-{thread_id} {error_msg}")
            print(f"[DEBUG] {trace_id} Thread-{thread_id} Raw JSON string: {json_str[:200]}...")

            # Log JSON decode error
            self.trace_logger.log_response(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                response_status=200,  # Request succeeded but JSON failed
                response_content=json_str[:1000] if 'json_str' in locals() else "N/A",
                processing_time=processing_time,
                error=error_msg
            )

            # Log failure summary
            self.trace_logger.log_summary(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                success=False,
                fallback_used=False
            )
            return None
        except requests.exceptions.RequestException as e:
            processing_time = time.time() - start_time
            error_msg = f"Request error for {country_key}: {e}"
            print(f"[ERROR] {trace_id} Thread-{thread_id} {error_msg}")

            # Log request error
            self.trace_logger.log_response(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                response_status=0,  # No response received
                response_content="N/A",
                processing_time=processing_time,
                error=error_msg
            )

            # Log failure summary
            self.trace_logger.log_summary(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                success=False,
                fallback_used=False
            )
            return None
        except Exception as e:
            processing_time = time.time() - start_time
            error_msg = f"Unexpected error for {country_key}: {e}"
            print(f"[ERROR] {trace_id} Thread-{thread_id} {error_msg}")

            # Log unexpected error
            self.trace_logger.log_response(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                response_status=0,  # No meaningful response
                response_content="N/A",
                processing_time=processing_time,
                error=error_msg
            )

            # Log failure summary
            self.trace_logger.log_summary(
                trace_id=trace_id,
                country_key=country_key,
                thread_id=thread_id,
                success=False,
                fallback_used=False
            )
            return None

    def process_single_country(self, country_key: str, filename: str, thread_id: int = 0) -> Tuple[str, Optional[Dict], bool]:
        """Process a single country and return results"""
        print(f"[PROCESSING] Thread-{thread_id} {country_key} ({filename})...")

        # Read taxation file
        tax_content = self.read_taxation_file(filename)

        if tax_content is None:
            # Use original data if no file available
            if country_key in self.original_data:
                print(f"[SKIP] Thread-{thread_id} Using original data for {country_key}")
                return country_key, self.original_data[country_key], False  # False = not processed with LLM
            else:
                print(f"[SKIP] Thread-{thread_id} No original data found for {country_key}")
                return country_key, None, False

        # Analyze with LLM
        original_country_data = self.original_data.get(country_key, {})
        updated_country_data = self.analyze_with_llm(country_key, original_country_data, tax_content, thread_id)

        if updated_country_data:
            return country_key, updated_country_data, True  # True = processed with LLM
        else:
            # Fallback to original data
            if country_key in self.original_data:
                print(f"[WARNING] Thread-{thread_id} LLM analysis failed for {country_key}, using original data")
                return country_key, self.original_data[country_key], False
            else:
                print(f"[ERROR] Thread-{thread_id} LLM analysis failed and no original data for {country_key}")
                return country_key, None, False

    def compare_data(self, original: Dict, updated: Dict) -> Dict[str, List[str]]:
        """Compare original and updated data, return changes"""
        changes = {
            'added': [],
            'modified': [],
            'removed': [],
            'unchanged': []
        }

        # Check for modifications in existing countries
        for key in original.keys():
            if key in updated:
                if self._deep_compare(original[key], updated[key]):
                    changes['unchanged'].append(key)
                else:
                    changes['modified'].append(key)
                    # Log specific changes
                    self._log_detailed_changes(key, original[key], updated[key])
            else:
                changes['removed'].append(key)

        # Check for new countries
        for key in updated.keys():
            if key not in original:
                changes['added'].append(key)

        return changes

    def _deep_compare(self, obj1: Any, obj2: Any) -> bool:
        """Deep comparison of two objects"""
        if type(obj1) != type(obj2):
            return False

        if isinstance(obj1, dict):
            if set(obj1.keys()) != set(obj2.keys()):
                return False
            return all(self._deep_compare(obj1[k], obj2[k]) for k in obj1.keys())

        if isinstance(obj1, list):
            if len(obj1) != len(obj2):
                return False
            return all(self._deep_compare(obj1[i], obj2[i]) for i in range(len(obj1)))

        return obj1 == obj2

    def _log_detailed_changes(self, country_key: str, original: Dict, updated: Dict):
        """Log detailed changes for a country"""
        if country_key not in self.changes_log:
            self.changes_log[country_key] = []

        # Compare brackets
        orig_brackets = original.get('brackets', [])
        upd_brackets = updated.get('brackets', [])

        if orig_brackets != upd_brackets:
            self.changes_log[country_key].append(f"Tax brackets updated: {len(orig_brackets)} -> {len(upd_brackets)} brackets")

        # Compare VAT
        orig_vat = original.get('vat', {})
        upd_vat = updated.get('vat', {})

        if orig_vat != upd_vat:
            orig_rate = orig_vat.get('standard', 'N/A')
            upd_rate = upd_vat.get('standard', 'N/A')
            self.changes_log[country_key].append(f"VAT rate updated: {orig_rate}% -> {upd_rate}%")

        # Compare system
        if original.get('system') != updated.get('system'):
            self.changes_log[country_key].append(f"Tax system changed: {original.get('system')} -> {updated.get('system')}")

    def generate_updated_js(self, output_file: str = "js/taxData2.js"):
        """Generate updated JavaScript file with comments"""

        # Get changes summary
        changes = self.compare_data(self.original_data, self.updated_data)

        js_content = f"""// Tax data for major countries - UPDATED VERSION
// Generated by scripts/tax_data_updater.py on {time.strftime('%Y-%m-%d %H:%M:%S')}
//
// CHANGES SUMMARY:
// - Added: {len(changes['added'])} countries ({', '.join(changes['added']) if changes['added'] else 'none'})
// - Modified: {len(changes['modified'])} countries ({', '.join(changes['modified']) if changes['modified'] else 'none'})
// - Removed: {len(changes['removed'])} countries ({', '.join(changes['removed']) if changes['removed'] else 'none'})
// - Unchanged: {len(changes['unchanged'])} countries

export const taxData = {{
"""

        for country_key, country_data in self.updated_data.items():
            # Add comment indicating changes for this country
            if country_key in changes['added']:
                js_content += f"\n  // [ADDED] New country data from taxation analysis\n"
            elif country_key in changes['modified']:
                js_content += f"\n  // [MODIFIED] Updated from taxation analysis\n"
                if country_key in self.changes_log:
                    for change in self.changes_log[country_key]:
                        js_content += f"  // - {change}\n"
            else:
                js_content += f"\n  // [UNCHANGED] No changes from original data\n"

            js_content += f'  "{country_key}": {{\n'
            js_content += f'    name: "{country_data["name"]}",\n'
            js_content += f'    currency: "{country_data["currency"]}",\n'
            js_content += f'    system: "{country_data["system"]}",\n'
            js_content += f'    countryCode: "{country_data["countryCode"]}",\n'
            js_content += f'    coordinates: {country_data["coordinates"]},\n'

            # Add brackets
            js_content += '    brackets: [\n'
            for bracket in country_data['brackets']:
                max_val = bracket['max'] if bracket['max'] is not None else 'null'
                desc = f', description: "{bracket["description"]}"' if bracket.get('description') else ''
                js_content += f'      {{min: {bracket["min"]}, max: {max_val}, rate: {bracket["rate"]}{desc}}},\n'
            js_content += '    ]'

            # Add special taxes if present (BEFORE vat, following Ukraine structure)
            if country_data.get('special_taxes'):
                js_content += ',\n    special_taxes: [\n'
                for tax in country_data['special_taxes']:
                    # Format special_taxes properly to match the structure
                    js_content += f'      {{type: "{tax["type"]}", target: "{tax["target"]}", rate: {tax["rate"]}, description: "{tax["description"]}"}},\n'
                js_content += '    ]'

            # Add VAT if present (AFTER special_taxes, following Ukraine structure)
            if country_data.get('vat'):
                vat = country_data['vat']
                js_content += ',\n    vat: {\n'
                js_content += f'      hasVAT: {str(vat["hasVAT"]).lower()},\n'
                if vat.get('standard'):
                    js_content += f'      standard: {vat["standard"]},\n'
                if vat.get('reduced'):
                    js_content += f'      reduced: {vat["reduced"]},\n'
                if vat.get('description'):
                    js_content += f'      description: "{vat["description"]}",\n'
                if vat.get('notes'):
                    js_content += f'      notes: "{vat["notes"]}",\n'
                js_content += '    }'

            # Add notes if present
            if country_data.get('notes'):
                js_content += f',\n    notes: "{country_data["notes"]}"'

            js_content += '\n  },\n'

        js_content += """
};

// Helper function to get tax rate color for map visualization
export function getTaxRateColor(taxRate) {
  if (taxRate === 0) return '#45d153'; // Tax haven
  if (taxRate <= 15) return 'rgba(78,205,196,0.92)'; // Low
  if (taxRate <= 35) return '#ff8e53'; // Medium
  if (taxRate <= 50) return '#ff6b6b'; // High
  if (taxRate <= 55) return '#ee5a6f'; // Very high
  return '#cc2a41'; // Highest
}

// Helper function to get VAT information for a country
export function getCountryVAT(countryKey) {
  const country = taxData[countryKey];
  return country ? country.vat : null;
}

// Helper function to format VAT information for display
export function formatVATInfo(vatInfo) {
  if (!vatInfo) return 'No VAT information available';

  if (!vatInfo.hasVAT) {
    return vatInfo.notes || 'No VAT system';
  }

  let vatText = `Standard: ${vatInfo.standard}%`;

  if (vatInfo.reduced && vatInfo.reduced.length > 0) {
    vatText += `, Reduced: ${vatInfo.reduced.join('%/')}%`;
  }

  if (vatInfo.zeroRated) {
    vatText += ', Zero-rated items available';
  }

  return vatText;
}
"""

        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(js_content)
            print(f"[SUCCESS] Generated updated tax data file: {output_file}")
            return True
        except Exception as e:
            print(f"[ERROR] Error writing output file: {e}")
            return False

    def process_all_countries(self):
        """Main processing function"""
        print("[START] Starting Tax Data Update Process...")

        # Check services
        if not self.check_services():
            return False

        # Parse existing data
        if not self.parse_taxdata_js():
            return False

        # Get country mapping
        country_mapping = self.get_country_key_mapping()

        # Check which taxation files exist before processing
        existing_files, missing_files = self.check_existing_taxation_files(country_mapping)

        # Process each country
        self.updated_data = {}
        processed = 0
        skipped = 0

        # Filter mapping to only include countries that exist in original data
        valid_countries = {k: v for k, v in country_mapping.items() if k in self.original_data}

        # Further filter based on file existence if requested
        if self.only_with_files:
            valid_countries = {k: v for k, v in valid_countries.items() if k in existing_files}
            print(f"[INFO] Processing {len(valid_countries)} countries (only those with taxation files)")
            print(f"[FILTER] Skipping {len(country_mapping) - len(valid_countries)} countries without files")
        else:
            print(f"[INFO] Processing {len(valid_countries)} countries out of {len(country_mapping)} mapped countries")

        print(f"[PARALLEL] Using {self.max_workers} worker threads for LLM processing")

        # Process countries in parallel
        country_items = list(valid_countries.items())

        with concurrent.futures.ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all tasks
            future_to_country = {}
            for i, (country_key, filename) in enumerate(country_items):
                future = executor.submit(self.process_single_country, country_key, filename, i + 1)
                future_to_country[future] = country_key

            print(f"\n[PARALLEL] Submitted {len(future_to_country)} tasks to thread pool")

            # Collect results as they complete
            for future in concurrent.futures.as_completed(future_to_country):
                country_key = future_to_country[future]
                try:
                    result_country_key, country_data, was_processed = future.result()

                    # Thread-safe update of results
                    with self._lock:
                        if country_data is not None:
                            self.updated_data[result_country_key] = country_data
                            if was_processed:
                                processed += 1
                                print(f"[COMPLETED] {result_country_key} processed with LLM")
                            else:
                                skipped += 1
                                print(f"[COMPLETED] {result_country_key} used original data")
                        else:
                            skipped += 1
                            print(f"[COMPLETED] {result_country_key} failed to process")

                except Exception as exc:
                    with self._lock:
                        skipped += 1
                    print(f"[ERROR] {country_key} generated an exception: {exc}")

        print(f"\n[PARALLEL] All {len(country_items)} tasks completed")

        print(f"\n[SUMMARY] Processing Summary:")
        print(f"   [SUCCESS] Successfully processed: {processed}")
        print(f"   [SKIP] Skipped (no file/error): {skipped}")
        print(f"   [TOTAL] Total countries: {len(self.updated_data)}")

        # Generate output file
        success = self.generate_updated_js()

        if success:
            print(f"\n[COMPLETE] Tax data update completed successfully!")
            print(f"[FILE] Updated file: js/taxData2.js")

        return success


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Tax Data Updater - Process taxation files with LLM analysis",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Default mode (auto provider selection, parallel processing)
  python scripts/tax_data_updater.py

  # Use OpenAI API with GPT-4o mini
  python scripts/tax_data_updater.py --provider openai --model gpt-4o-mini

  # Use OpenAI with custom API key
  python scripts/tax_data_updater.py --provider openai --model gpt-4o-mini --openai-api-key "your-key"

  # Force Ollama provider
  python scripts/tax_data_updater.py --provider ollama --model "deepseek-r1:8b"

  # Sequential processing (no multi-threading)
  python scripts/tax_data_updater.py --no-parallel

  # Enable streaming for real-time response tracing
  python scripts/tax_data_updater.py --streaming

  # Sequential + streaming with OpenAI
  python scripts/tax_data_updater.py --provider openai --model gpt-4o-mini --no-parallel --streaming

  # Custom worker count
  python scripts/tax_data_updater.py --workers 8

  # Only process countries with taxation files
  python scripts/tax_data_updater.py --only-with-files
        """
    )

    parser.add_argument(
        "--no-parallel",
        action="store_true",
        help="Disable multi-threading (process countries sequentially)"
    )

    parser.add_argument(
        "--streaming",
        action="store_true",
        help="Enable real-time LLM response streaming and tracing"
    )

    parser.add_argument(
        "--workers",
        type=int,
        default=4,
        help="Number of worker threads for parallel processing (default: 4, ignored if --no-parallel)"
    )

    parser.add_argument(
        "--model",
        type=str,
        default="gemma3:12b",
        help="LLM model name to use (default: gemma3:12b)"
    )

    parser.add_argument(
        "--ollama-url",
        type=str,
        default="http://localhost:5001",
        help="Ollama proxy URL (default: http://localhost:5001)"
    )

    parser.add_argument(
        "--web-extractor-url",
        type=str,
        default="http://localhost:5000",
        help="Web extractor URL (default: http://localhost:5000)"
    )

    parser.add_argument(
        "--provider",
        type=str,
        choices=["auto", "ollama", "openai"],
        default="auto",
        help="LLM provider to use: auto (smart selection), ollama (local), openai (API) (default: auto)"
    )

    parser.add_argument(
        "--openai-api-key",
        type=str,
        help="OpenAI API key (if not set in environment variable OPENAI_API_KEY)"
    )

    parser.add_argument(
        "--only-with-files",
        action="store_true",
        help="Only process countries that have taxation files (skip countries without files)"
    )

    args = parser.parse_args()

    print("Tax Data Updater v2.0 - Enhanced Edition")
    print("=" * 50)

    # Create processor with specified options
    processor = TaxDataProcessor(
        web_extractor_url=args.web_extractor_url,
        ollama_proxy_url=args.ollama_url,
        model_name=args.model,
        max_workers=args.workers,
        enable_parallel=not args.no_parallel,
        enable_streaming=args.streaming,
        provider=args.provider,
        openai_api_key=args.openai_api_key,
        only_with_files=args.only_with_files
    )

    success = processor.process_all_countries()

    if success:
        print("\n[SUCCESS] All done! Check js/taxData2.js for updated tax data.")
        if args.streaming:
            print("[INFO] Streaming logs saved in logs/ directory with trace IDs")
    else:
        print("\n[ERROR] Process completed with errors. Check the logs above.")
        print("[INFO] Detailed trace logs available in logs/ directory")

    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
