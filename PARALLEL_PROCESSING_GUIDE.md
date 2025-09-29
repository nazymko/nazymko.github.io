# Parallel Processing Guide

All scripts have been enhanced with parallel processing capabilities to significantly speed up LLM requests and file generation.

## 🚀 **Performance Improvements**

### Before (Sequential)
- **51 countries** × 3 seconds per LLM request = **~3 minutes**
- One request at a time, waiting for each to complete

### After (Parallel)
- **51 countries** ÷ 4 threads = **~45 seconds**
- Multiple requests processed simultaneously
- **4x faster processing time**

## 🔧 **Enhanced Scripts**

### 1. tax_data_updater.py
```bash
python scripts/tax_data_updater.py
```

**Parallel Features:**
- **4 worker threads** by default (configurable)
- Thread-safe data collection
- Per-thread logging with Thread-ID tracking
- Concurrent LLM analysis of taxation files

**Sample Output:**
```
[PARALLEL] Using 4 worker threads for LLM processing
[PARALLEL] Submitted 45 tasks to thread pool
[LLM-REQUEST] Thread-1 POST http://localhost:5001/chat
[LLM-REQUEST] Thread-2 POST http://localhost:5001/chat
[LLM-REQUEST] Thread-3 POST http://localhost:5001/chat
[LLM-REQUEST] Thread-4 POST http://localhost:5001/chat
[COMPLETED] germany processed with LLM
[COMPLETED] france processed with LLM
[PARALLEL] All 45 tasks completed
```

### 2. generate_enhanced_taxation_files.py
```bash
python scripts/generate_enhanced_taxation_files.py
```

**Parallel Features:**
- **3 worker threads** (conservative for stability)
- Parallel Wikipedia fetching + LLM formatting
- Thread-safe file operations
- Concurrent content generation

**Sample Output:**
```
[PARALLEL] Using 3 worker threads for enhanced generation
[PARALLEL] Submitted 51 tasks to thread pool
[LLM-REQUEST] Thread-1 POST http://localhost:5001/chat
[FETCH] Thread-2 Getting Wikipedia content for germany
[FORMAT] Thread-3 Restructuring content with LLM
[COMPLETED] germany - SUCCESS
[PARALLEL] All 51 tasks completed
```

### 3. research_and_format.py
```bash
python scripts/research_and_format.py
```

**Parallel Features:**
- **3 worker threads** for research tasks
- Concurrent LLM research requests
- Thread-safe file writing
- Parallel country research

**Sample Output:**
```
[PARALLEL] Using 3 worker threads for research
[PARALLEL] Submitted 10 research tasks to thread pool
[LLM-REQUEST] Thread-1 POST http://localhost:5001/chat - Researching france
[LLM-REQUEST] Thread-2 POST http://localhost:5001/chat - Researching germany
[COMPLETED] france - SUCCESS
[PARALLEL] All 10 research tasks completed
```

### 4. generate_taxation_files.py
**Note:** This script remains sequential as it only uses the Web Content Extractor API, not LLM processing.

## ⚙️ **Configuration Options**

### Adjusting Worker Threads

**tax_data_updater.py:**
```python
# In main() function, change max_workers:
processor = TaxDataProcessor(max_workers=6)  # 2-8 recommended
```

**generate_enhanced_taxation_files.py:**
```python
# In main() function, change max_workers:
max_workers = 5  # 2-6 recommended
```

**research_and_format.py:**
```python
# In main() function, change max_workers:
max_workers = 4  # 2-6 recommended
```

## 📊 **Thread Safety Features**

### Thread-Safe Operations
- **Shared data access** protected with locks
- **File writing** coordinated to prevent conflicts
- **Progress tracking** synchronized across threads
- **Error handling** isolated per thread

### Logging Enhancements
- **Thread-ID tracking** in all log messages
- **Endpoint identification** for each API call
- **Model specification** for each LLM request
- **Payload logging** for debugging
- **Response tracking** with detailed status

## 🎯 **Optimal Settings**

### Recommended Thread Counts

**For Tax Data Updater:**
- **4 threads** - Balanced performance/stability
- **6 threads** - Maximum performance (if system can handle)
- **2 threads** - Conservative (older systems)

**For Enhanced Generation:**
- **3 threads** - Recommended (stable)
- **4 threads** - Aggressive (newer systems)
- **2 threads** - Conservative

**For Research Tasks:**
- **3 threads** - Recommended
- **4 threads** - Maximum practical
- **2 threads** - Safe minimum

### System Requirements
- **RAM:** 8GB+ recommended for 4+ threads
- **CPU:** 4+ cores recommended
- **Network:** Stable connection to local services
- **Ollama:** Should handle concurrent requests well

## 🔍 **Monitoring Parallel Execution**

### Key Log Messages to Watch

**Successful Parallel Processing:**
```
[PARALLEL] Using X worker threads
[PARALLEL] Submitted X tasks to thread pool
[LLM-REQUEST] Thread-N POST endpoint
[LLM-RESPONSE] Thread-N HTTP 200
[COMPLETED] country - SUCCESS
[PARALLEL] All X tasks completed
```

**Thread Performance Issues:**
```
[ERROR] Thread-N Request timeout
[ERROR] Thread-N LLM request failed
[WARNING] Thread-N LLM analysis failed
```

### Performance Monitoring
- **Watch completion order** - should be mixed, not sequential
- **Monitor response times** - should be concurrent
- **Check error rates** - should be low with parallel processing
- **Observe resource usage** - CPU/memory should be higher

## ⚠️ **Troubleshooting**

### Common Issues

**Too many threads:**
```
[ERROR] Connection pool exhausted
[ERROR] Request timeout
```
→ Reduce max_workers to 2-3

**Memory issues:**
```
[ERROR] Out of memory
System sluggish
```
→ Reduce max_workers or increase system RAM

**Ollama overload:**
```
[ERROR] HTTP 429 Too Many Requests
[ERROR] Model timeout
```
→ Reduce max_workers or upgrade Ollama setup

### Performance Tuning

**Increase threads if:**
- System has spare CPU/RAM
- All requests complete quickly
- No timeout errors

**Decrease threads if:**
- Getting timeout errors
- System becomes sluggish
- Connection errors occur

## 🎉 **Expected Results**

### Speed Improvements
- **Tax Data Updater:** 3-4x faster (3 min → 45 sec)
- **Enhanced Generation:** 3-4x faster (8 min → 2 min)
- **Research Tasks:** 3x faster (90 sec → 30 sec)

### Resource Usage
- **CPU:** Higher utilization (good)
- **Memory:** Modest increase
- **Network:** More concurrent connections
- **Ollama:** Higher model utilization

The parallel processing enhancements maintain all existing functionality while dramatically improving performance through concurrent execution of LLM requests.