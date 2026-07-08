# scratch/test_api.py
import requests
import time

print("Profiling FastAPI API endpoints...")

def profile_endpoint(url):
    try:
        start_time = time.time()
        response = requests.get(url)
        duration = time.time() - start_time
        print(f"GET {url}")
        print(f"  Status code: {response.status_code}")
        print(f"  Response time: {duration:.4f} seconds")
        print(f"  Response size: {len(response.content) / 1024:.2f} KB")
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"  Items returned: {len(data) if isinstance(data, list) else 1}")
            except Exception:
                pass
    except Exception as e:
        print(f"  Error accessing {url}: {e}")

# Profile endpoints
profile_endpoint("http://127.0.0.1:8000/api/v1/institutions")
profile_endpoint("http://127.0.0.1:8000/api/v1/domains")
