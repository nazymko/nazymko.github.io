# Scripts Directory

This directory contains all Python scripts and related data files for the Global Tax Calculator Map project, separated from the main web application code.

## Structure

```
scripts/
├── README.md                              # This file
├── data/                                 # Generated taxation data files
│   ├── taxation_albania.txt
│   ├── taxation_andorra.txt
│   ├── taxation_argentina.txt
│   └── ... (all taxation_*.txt files)
├── apply_tax_updates.py                  # Tax data update application script
├── generate_enhanced_taxation_files.py   # Enhanced taxation file generator with LLM
├── generate_taxation_files.py            # Basic taxation file generator
├── research_and_format.py               # Country taxation research script
├── simple_tax_updater.py                # Simplified tax data updater
├── tax_data_updater.py                  # Main tax data updater with LLM analysis
└── update_tax_data.py                   # Alternative tax data update script
```

## Scripts Overview

### Core Tax Data Scripts

**`tax_data_updater.py`** - Main tax data processing script
- Reads existing `taxData.js` and `scripts/data/taxation_*.txt` files
- Uses local LLM (via Ollama Proxy) to analyze taxation information
- Generates updated `taxData2.js` with enhanced tax data
- **Enforces strict JSON structure validation** to match original format
- **Configurable parallel/sequential processing** with `--no-parallel` option
- **Real-time streaming support** with `--streaming` for live LLM response tracing
- **Includes Ukraine example structure** for LLM guidance
- **Full trace logging** with unique trace IDs for debugging
- **Command-line options** for model selection, worker count, and URLs
- **Usage**: `python scripts/tax_data_updater.py [options]`

**`apply_tax_updates.py`** - Tax data update application
- Applies tax updates from JSON configuration files
- Handles bulk updates to tax systems
- **Usage**: `python scripts/apply_tax_updates.py`

### Data Generation Scripts

**`generate_enhanced_taxation_files.py`** - Enhanced file generator
- Fetches taxation information from Wikipedia
- Uses LLM to format and structure the content
- Supports parallel processing with 3 worker threads
- **Usage**: `python scripts/generate_enhanced_taxation_files.py`

**`generate_taxation_files.py`** - Basic file generator
- Generates basic taxation files using web content extraction
- Sequential processing for stability
- **Usage**: `python scripts/generate_taxation_files.py`

**`research_and_format.py`** - Research and formatting tool
- Researches specific countries' taxation systems
- Uses LLM for content analysis and formatting
- Supports parallel processing for research tasks
- **Usage**: `python scripts/research_and_format.py`

### Utility Scripts

**`simple_tax_updater.py`** - Simplified updater
- Lightweight version of the main tax data updater
- Fewer features but faster execution
- **Usage**: `python scripts/simple_tax_updater.py`

**`update_tax_data.py`** - Alternative updater
- Alternative approach to tax data updates
- **Usage**: `python scripts/update_tax_data.py`

## Data Directory

The `scripts/data/` directory contains generated taxation files for each supported country:

- **File naming**: `taxation_[country_name].txt`
- **Content**: Detailed taxation information for each country
- **Format**: Plain text with structured taxation data
- **Usage**: Read by `tax_data_updater.py` for LLM analysis

### Supported Countries

The data directory contains taxation files for 50+ countries including:
- European Union countries (Germany, France, Italy, Spain, etc.)
- Nordic countries (Denmark, Finland, Sweden, Norway, Iceland)
- Baltic states (Estonia, Latvia, Lithuania)
- Major economies (United States, United Kingdom, Japan, China)
- Tax havens and special jurisdictions (Monaco, Liechtenstein, UAE)
- Asian countries (Singapore, Hong Kong, South Korea)
- Other regions (Canada, Australia, Brazil, etc.)

## Prerequisites

### Required Services
1. **Web Content Extractor API** on `http://localhost:5000`
2. **LLM Provider** (choose one):
   - **Ollama Proxy API** on `http://localhost:5001` with a suitable model (llama2, deepseek-r1, etc.)
   - **OpenAI API** with API key configured

### Required Python Packages
```bash
pip install requests
# For OpenAI support:
pip install openai
```

### OpenAI API Configuration

To use OpenAI providers, configure your API key using one of these methods (in order of priority):

1. **API Key File** (Recommended):
   ```bash
   # Create the key file in project root
   echo "your-openai-api-key-here" > open-api.key
   ```

2. **Command Line Argument**:
   ```bash
   python scripts/tax_data_updater.py --provider openai --openai-api-key "your-key"
   ```

3. **Environment Variable**:
   ```bash
   export OPENAI_API_KEY="your-openai-api-key-here"
   python scripts/tax_data_updater.py --provider openai
   ```

## Usage Workflow

### 1. Basic Tax Data Update

**Using Ollama (Local):**
```bash
# Generate or update taxation files
python scripts/generate_enhanced_taxation_files.py

# Process files with LLM and update tax data (default: auto provider selection)
python scripts/tax_data_updater.py
```

**Using OpenAI API:**
```bash
# First, ensure API key is configured (see Prerequisites above)
# Then run with OpenAI provider
python scripts/tax_data_updater.py --provider openai --model gpt-4o-mini
```

#### Advanced Processing Options

**Sequential Processing (No Multi-threading)**:
```bash
python scripts/tax_data_updater.py --no-parallel
```

**Real-time Streaming Mode**:
```bash
python scripts/tax_data_updater.py --streaming
```

**Sequential + Streaming**:
```bash
python scripts/tax_data_updater.py --no-parallel --streaming
```

**Custom Configuration**:
```bash
# Custom worker count
python scripts/tax_data_updater.py --workers 8

# Different model
python scripts/tax_data_updater.py --model "deepseek-r1:8b"

# Custom URLs
python scripts/tax_data_updater.py --ollama-url "http://localhost:11434"

# Only process countries with taxation files (skip missing files)
python scripts/tax_data_updater.py --only-with-files
```

**Help and Options**:
```bash
python scripts/tax_data_updater.py --help
```

### 2. Research New Countries
```bash
# Research specific countries
python scripts/research_and_format.py

# Apply updates to tax data
python scripts/tax_data_updater.py
```

### 3. Bulk Updates
```bash
# Apply bulk updates from configuration
python scripts/apply_tax_updates.py
```

## Performance Features

### Parallel Processing
Most scripts support parallel processing for improved performance:
- **tax_data_updater.py**: 4 worker threads (configurable)
- **generate_enhanced_taxation_files.py**: 3 worker threads
- **research_and_format.py**: 3 worker threads

### Typical Performance
- **Tax Data Update**: ~45 seconds (was 3 minutes)
- **Enhanced Generation**: ~2 minutes (was 8 minutes)
- **Research Tasks**: ~30 seconds (was 90 seconds)

## Output

All scripts generate files in the main project directory:
- **taxData2.js**: Updated tax data for the web application
- **taxation_*.txt**: Country-specific taxation information files
- **logs**: Console output with detailed processing information

## JSON Structure Validation

The `tax_data_updater.py` script enforces strict structure validation to ensure generated data matches the original taxData.js format exactly.

### Required Structure (Ukraine Example)
```javascript
"ukraine": {
    name: "Ukraine",
    currency: "UAH",
    system: "flat",
    countryCode: "UA",
    coordinates: [50.4501, 30.5234],
    brackets: [{min: 0, max: null, rate: 18}],
    special_taxes: [
        {type: "military_levy", target: "gross", rate: 5, description: "Additional 5% military levy on all income"},
        {type: "united_social_tax", target: "gross", rate: 22, description: "22% united social tax on gross income for employees"}
    ],
    vat: {
        hasVAT: true,
        standard: 20.0,
        description: "Standard 20.0%"
    }
}
```

### Validation Rules
- **Field Order**: name, currency, system, countryCode, coordinates, brackets, [special_taxes], vat, [notes]
- **Required Fields**: name, currency, system, countryCode, coordinates, brackets
- **System Values**: Must be "progressive", "flat", or "zero_personal"
- **Coordinates**: Must be array of two numbers [latitude, longitude]
- **Brackets**: Must be non-empty array with min, max, rate fields
- **VAT**: Must include hasVAT boolean field
- **Special Taxes**: Must include type, target, rate, description fields

### Validation Failure Handling
If LLM-generated data fails validation, the script automatically falls back to original data for that country and logs detailed error messages.

## Trace Logging System

The `tax_data_updater.py` script includes comprehensive trace logging for debugging and monitoring individual LLM requests.

### Trace ID Format
Each request gets a unique trace ID: `trace_YYYYMMDD_HHMMSS_[8-char-uuid]`

Example: `trace_20250927_143052_a7b3c2d1`

### Log Files Generated
For each LLM request, the following files are created in the `logs/` directory:

**Standard Mode** (3 files per request):
- `{trace_id}_request.log` - Request details and payload
- `{trace_id}_response.log` - Response details and validation
- `{trace_id}_summary.log` - Processing summary and final data

**Streaming Mode** (5 files per request):
- All standard files above, plus:
- `{trace_id}_stream.log` - Real-time streaming chunks (one JSON per line)
- `{trace_id}_stream_summary.log` - Streaming completion summary

**Request Log** (`{trace_id}_request.log`):
```json
{
  "trace_id": "trace_20250927_143052_a7b3c2d1",
  "timestamp": "2025-09-27T14:30:52.123456",
  "country": "ukraine",
  "thread_id": 2,
  "request_url": "http://localhost:5001/chat",
  "model_name": "gemma3:12b",
  "request_payload": {
    "model": "gemma3:12b",
    "messages": [{"role": "user", "content": "FULL TAXATION CONTENT HERE (no truncation)"}],
    "stream": false,
    "content_metadata": {
      "content_length_chars": 15420,
      "content_lines": 187,
      "is_truncated": false,
      "full_content_included": true
    }
  }
}
```

**Response Log** (`{trace_id}_response.log`):
```json
{
  "trace_id": "trace_20250927_143052_a7b3c2d1",
  "timestamp": "2025-09-27T14:30:54.567890",
  "country": "ukraine",
  "thread_id": 2,
  "response_status": 200,
  "processing_time_seconds": 2.45,
  "validation_result": true,
  "response_content": "{ \"name\": \"Ukraine\", ... }",
  "extracted_data": { ... },
  "error": null
}
```

**Summary Log** (`{trace_id}_summary.log`):
```json
{
  "trace_id": "trace_20250927_143052_a7b3c2d1",
  "timestamp": "2025-09-27T14:30:54.678901",
  "country": "ukraine",
  "thread_id": 2,
  "success": true,
  "fallback_used": false,
  "final_data": { ... }
}
```

**Streaming Log** (`{trace_id}_stream.log`) - Only in streaming mode:
```json
{"trace_id": "trace_20250927_143052_a7b3c2d1", "timestamp": "2025-09-27T14:30:52.123456", "country": "ukraine", "thread_id": 2, "chunk_number": 1, "chunk_content": "{", "chunk_length": 1}
{"trace_id": "trace_20250927_143052_a7b3c2d1", "timestamp": "2025-09-27T14:30:52.134567", "country": "ukraine", "thread_id": 2, "chunk_number": 2, "chunk_content": "\n  \"name\":", "chunk_length": 9}
{"trace_id": "trace_20250927_143052_a7b3c2d1", "timestamp": "2025-09-27T14:30:52.145678", "country": "ukraine", "thread_id": 2, "chunk_number": 3, "chunk_content": " \"Ukraine\",", "chunk_length": 10}
```

### Console Logging with Trace IDs
All console output includes trace IDs for easy correlation:

**Standard Mode**:
```
[TRACE-START] trace_20250927_143052_a7b3c2d1 Thread-2 Starting LLM analysis for ukraine
[LLM-REQUEST] trace_20250927_143052_a7b3c2d1 Thread-2 POST http://localhost:5001/chat
[LLM-PROMPT] trace_20250927_143052_a7b3c2d1 Thread-2 Analyzing 15420 characters of taxation content for ukraine
[LLM-CONTENT-SIZE] trace_20250927_143052_a7b3c2d1 Thread-2 Full content included in request (no truncation)
[LLM-TIMEOUT] trace_20250927_143052_a7b3c2d1 Thread-2 Request timeout: 300 seconds
[LLM-RESPONSE] trace_20250927_143052_a7b3c2d1 Thread-2 HTTP 200 (took 2.45s)
[VALIDATION-SUCCESS] trace_20250927_143052_a7b3c2d1 Thread-2 Structure validation passed for ukraine
[SUCCESS] trace_20250927_143052_a7b3c2d1 Thread-2 Successfully analyzed ukraine
[TRACE-LOG] trace_20250927_143052_a7b3c2d1 Summary logged to logs/trace_20250927_143052_a7b3c2d1_summary.log
```

**Streaming Mode** (additional real-time output):
```
[LLM-STREAMING] trace_20250927_143052_a7b3c2d1 Thread-2 Streaming mode enabled - real-time response tracing
[STREAM-START] trace_20250927_143052_a7b3c2d1 Thread-2 Starting streaming response from http://localhost:5001
[STREAM-CHUNK] trace_20250927_143052_a7b3c2d1 Thread-2 Chunk-1: {
[STREAM-CHUNK] trace_20250927_143052_a7b3c2d1 Thread-2 Chunk-2: "name":
[STREAM-CHUNK] trace_20250927_143052_a7b3c2d1 Thread-2 Chunk-3: "Ukraine",
[STREAM-CHUNK] trace_20250927_143052_a7b3c2d1 Thread-2 Chunk-4: "currency":
[STREAM-COMPLETE] trace_20250927_143052_a7b3c2d1 Thread-2 Streaming completed: 47 chunks, 1247 chars in 2.45s
[LLM-RESPONSE] trace_20250927_143052_a7b3c2d1 Thread-2 HTTP 200 STREAMING from http://localhost:5001 (took 2.45s)
```

### Debugging Benefits
- **Full Request Reconstruction**: Complete payload and headers for every LLM call
- **Complete Content Logging**: Full taxation content included (no truncation at 4000 chars)
- **Real-time Streaming Traces**: Live monitoring of LLM response generation (streaming mode)
- **Content Metadata**: Character count, line count, and truncation status tracking
- **Performance Tracking**: Exact processing times per request
- **Sequential Processing**: Disable multi-threading for easier debugging (`--no-parallel`)
- **Error Analysis**: Detailed error context and failure modes
- **Validation Debugging**: See exactly which validation rules failed
- **Thread Correlation**: Track requests across parallel processing threads
- **Fallback Tracking**: Understand when and why fallbacks were used

### Log File Cleanup
Log files are created in the `logs/` directory:
- **Standard mode**: 3 files per country (request, response, summary)
- **Streaming mode**: 5 files per country (+ stream, stream_summary)

Consider periodic cleanup of old log files to manage disk space.

## Integration with Main Application

The scripts are designed to work with the main tax calculator web application:
1. Generate/update taxation data files in `scripts/data/`
2. Process files with `tax_data_updater.py` to create `taxData2.js`
3. Replace `js/taxData.js` with `js/taxData2.js` in the main application
4. The web application automatically uses the updated tax data

## Troubleshooting

### Common Issues
- **Service unavailable**: Ensure Ollama and proxy services are running
- **File not found**: Check that taxation files exist in `scripts/data/`
- **Permission errors**: Ensure write permissions for output files
- **Memory issues**: Reduce worker thread counts in parallel processing

### Debugging with Trace Logs
When issues occur, use trace logs for detailed analysis:

1. **Find the failing request**:
   ```bash
   # Look for trace IDs in console output
   grep "ERROR" console_output.log
   ```

2. **Examine the request**:
   ```bash
   # Check the full request payload
   cat logs/trace_20250927_143052_a7b3c2d1_request.log
   ```

3. **Analyze the response**:
   ```bash
   # See what the LLM actually returned
   cat logs/trace_20250927_143052_a7b3c2d1_response.log
   ```

4. **Check validation details**:
   ```bash
   # See which validation rules failed
   grep "VALIDATION-ERROR" console_output.log | grep "trace_20250927_143052_a7b3c2d1"
   ```

### Debug Mode
Add debug output to any script:
```python
print(f"Debug: {variable_name}")  # Add debug prints as needed
```

## Contributing

When adding new scripts or modifying existing ones:
1. Follow the existing naming conventions
2. Add documentation to this README
3. Update the main project documentation if needed
4. Test with the full workflow before committing

## License

These scripts are part of the Global Tax Calculator Map project and follow the same license terms as the main application.
