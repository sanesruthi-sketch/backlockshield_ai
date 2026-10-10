from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    """Verify that the health check endpoint returns 200 OK and valid metadata."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "DEBUG MASTERS" in data["team"]

def test_root_endpoint():
    """Verify root endpoint redirect and metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["docs_url"] == "/docs"
