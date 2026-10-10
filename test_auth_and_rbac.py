from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_login_valid_and_invalid():
    """Verify login authentication generates JWT token for demo accounts and rejects invalid passwords."""
    # 1. Invalid password
    bad_resp = client.post("/api/v1/auth/login", json={
        "email": "a.rivera@campus.edu",
        "password": "wrongpassword"
    })
    assert bad_resp.status_code == 401

    # 2. Valid Student login
    good_resp = client.post("/api/v1/auth/login", json={
        "email": "a.rivera@campus.edu",
        "password": "password123"
    })
    assert good_resp.status_code == 200
    token_data = good_resp.json()
    assert "access_token" in token_data
    assert token_data["role"] == "student"

def test_rbac_admin_endpoint_rejection():
    """Verify student bearer token is rejected when attempting to access admin endpoints."""
    # Login as student
    login_resp = client.post("/api/v1/auth/login", json={
        "email": "a.rivera@campus.edu",
        "password": "password123"
    })
    token = login_resp.json()["access_token"]

    # Attempt to access admin users endpoint
    admin_resp = client.get("/api/v1/admin/users", headers={
        "Authorization": f"Bearer {token}"
    })
    assert admin_resp.status_code == 403
