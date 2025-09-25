# Web Extractor API Endpoints

This document lists the current API endpoints used by the Enhanced Taxation File Generator.

## Web Content Extractor (localhost:5000)

### Core Endpoints
- `GET /` - API information
- `GET /health` - Health check
- `POST /extract` - Extract content from URL
- `GET /files` - List all saved files
- `GET /txt-files` - List all txt files in directory
- `GET /files/<filename>` - Read a specific saved file

### Usage in Code

#### List TXT Files
```python
response = requests.get("http://localhost:5000/txt-files")
# Returns: {"success": true, "txt_files": [...], "count": N, "files_info": {...}}
```

#### Fetch File Content
```python
response = requests.get("http://localhost:5000/files/taxation_germany.txt")
# Returns: Plain text content of the file
```

#### Extract Content from URL
```python
payload = {"url": "https://en.wikipedia.org/wiki/Taxation_in_Germany"}
response = requests.post("http://localhost:5000/extract", json=payload)
# Returns: {"success": true, "content": "..."}
```

## Ollama Proxy (localhost:5001)

### Core Endpoints
- `GET /health` - Health check
- `GET /models` - List available models
- `POST /chat` - Send chat request to LLM

### Usage in Code

#### Chat with LLM
```python
payload = {
    "model": "gemma3:12b",
    "messages": [{"role": "user", "content": "..."}],
    "stream": false
}
response = requests.post("http://localhost:5001/chat", json=payload)
# Returns: {"message": {"content": "..."}}
```

## Enhanced Taxation File Generator Commands

```bash
# List available txt files
python scripts/generate_enhanced_taxation_files.py --list-txt-files

# Process existing taxation files from web extractor
python scripts/generate_enhanced_taxation_files.py --process-existing

# Generate new files from Wikipedia (default mode)
python scripts/generate_enhanced_taxation_files.py
```

## Error Handling

All API calls include:
- 30-second timeout
- HTTP status code checking
- Colored error messages
- Retry logic for 500 errors (in LLM processing)

## Notes

- All file operations use UTF-8 encoding
- The web extractor serves files from its current working directory
- Files starting with "taxation" are automatically filtered for processing
- Processed files are saved to `scripts/data/` directory