import pytest

def test_register_user(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_login_user(client):
    # Register first
    client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "testpassword"}
    )
    
    # Login
    response = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "testpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_get_me(client):
    # Register and login
    client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "testpassword"}
    )
    login_res = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "testpassword"}
    )
    token = login_res.json()["access_token"]
    
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"
    assert response.json()["email"] == "test@example.com"

def test_update_profile(client):
    # Register and login
    client.post(
        "/api/auth/register",
        json={"username": "testuser", "email": "test@example.com", "password": "testpassword"}
    )
    login_res = client.post(
        "/api/auth/login",
        data={"username": "testuser", "password": "testpassword"}
    )
    token = login_res.json()["access_token"]
    
    # Update
    response = client.put(
        "/api/auth/profile",
        json={"username": "newusername", "email": "new@example.com"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    
    # Check
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    # Token is still valid with sub=testuser because sub was testuser
    # But current_user logic in main.py looks up by sub.
    # If sub was testuser, it will still find the same user record.
    assert me_res.json()["username"] == "newusername"
