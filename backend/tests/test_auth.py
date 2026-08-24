def test_login_success(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@techdist.mx", "password": "Techdist2025!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@techdist.mx"


def test_login_invalid_password(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@techdist.mx", "password": "WrongPassword!"},
    )
    assert response.status_code == 401
    assert "detail" in response.json()


def test_protected_endpoint_without_token(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_protected_endpoint_with_valid_token(client, admin_headers):
    response = client.get("/api/v1/auth/me", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "admin@techdist.mx"
    assert data["rol"] == "admin"


def test_refresh_token(client, admin_headers):
    response = client.post("/api/v1/auth/refresh", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
