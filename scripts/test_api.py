"""
Test the Fashion Retrieval API endpoints.
Run from the backend directory: python -m scripts.test_api
"""
import sys
import os
import json
import time
import httpx

BASE_URL = "http://localhost:8000"


def test_health():
    print("Testing /health ...")
    r = httpx.get(f"{BASE_URL}/health", timeout=10)
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
    print("  PASS\n")


def test_index_status():
    print("Testing /api/index/status ...")
    r = httpx.get(f"{BASE_URL}/api/index/status", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert "status" in data
    print(f"  Index status: {data['status']}")
    print(f"  Products: {data.get('num_products', 0)}")
    print("  PASS\n")
    return data


def test_build_index():
    print("Testing /api/index/build ...")
    r = httpx.post(f"{BASE_URL}/api/index/build", timeout=300)
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "success"
    print(f"  Built index with {data['num_products']} products")
    print("  PASS\n")


def test_text_search():
    print("Testing /api/search/text ...")
    r = httpx.post(
        f"{BASE_URL}/api/search/text",
        json={"query": "red dress", "top_k": 5},
        timeout=60,
    )
    assert r.status_code == 200
    data = r.json()
    assert data["query_type"] == "text"
    assert "results" in data
    print(f"  Found {len(data['results'])} results")
    for i, res in enumerate(data["results"][:3]):
        print(f"  #{i+1}: {res['name']} (score: {res['reranking_score']:.3f})")
    print("  PASS\n")


def test_catalog():
    print("Testing /api/catalog ...")
    r = httpx.get(f"{BASE_URL}/api/catalog", timeout=10)
    assert r.status_code == 200
    data = r.json()
    print(f"  Catalog: {data['total']} products")
    print("  PASS\n")


def main():
    print("=" * 50)
    print("Fashion Retrieval API Tests")
    print("=" * 50 + "\n")

    try:
        test_health()
        test_catalog()
        status = test_index_status()

        if status.get("status") != "ready":
            print("Index not built. Building now...")
            test_build_index()

        test_text_search()

        print("=" * 50)
        print("All tests passed!")
        print("=" * 50)

    except httpx.ConnectError:
        print("ERROR: Cannot connect to backend at", BASE_URL)
        print("Make sure the backend is running.")
    except AssertionError as e:
        print(f"FAIL: {e}")
    except Exception as e:
        print(f"ERROR: {e}")


if __name__ == "__main__":
    main()
