import requests
import os

BASE_URL = "http://localhost:8000"

def test_backend():
    print("Checking backend status...")
    try:
        res = requests.get(f"{BASE_URL}/")
        print(f"Status: {res.status_code}, Response: {res.json()}")
    except Exception as e:
        print(f"Backend not running or unreachable: {e}")

if __name__ == "__main__":
    test_backend()
