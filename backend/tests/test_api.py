"""
Backend API tests.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    from app.main import app
    return TestClient(app)


class TestHealthEndpoint:
    def test_health_check(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"


class TestIndexStatus:
    def test_index_status_not_built(self, client):
        response = client.get("/api/index/status")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "num_products" in data


class TestCatalog:
    def test_get_catalog(self, client):
        response = client.get("/api/catalog")
        assert response.status_code == 200
        data = response.json()
        assert "products" in data
        assert "total" in data


class TestTextValidation:
    def test_empty_text_query(self, client):
        response = client.post(
            "/api/search/text",
            json={"query": "", "top_k": 10},
        )
        assert response.status_code == 422

    def test_invalid_top_k(self, client):
        response = client.post(
            "/api/search/text",
            json={"query": "red dress", "top_k": -1},
        )
        assert response.status_code == 422

    def test_top_k_too_large(self, client):
        response = client.post(
            "/api/search/text",
            json={"query": "red dress", "top_k": 200},
        )
        assert response.status_code == 422


class TestSearchWithoutIndex:
    def test_text_search_no_index(self, client):
        with patch("app.api.routes_text.VectorSearchEngine") as MockEngine:
            instance = MagicMock()
            instance.load_index.return_value = False
            MockEngine.return_value = instance
            response = client.post(
                "/api/search/text",
                json={"query": "red dress", "top_k": 10},
            )
            assert response.status_code == 400
