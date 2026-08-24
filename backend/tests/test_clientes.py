def test_cliente_crud(client, vendedor_headers):
    # 1. Create
    create_res = client.post(
        "/api/v1/clientes/",
        headers=vendedor_headers,
        json={
            "nombre": "Acme Distribuciones SA",
            "industria": "Retail",
            "num_empleados": 350,
            "ciudad": "Monterrey",
            "segmento": "Mid-Market",
            "website": "https://acmedist.mx",
        },
    )
    assert create_res.status_code == 201
    cliente = create_res.json()
    assert cliente["nombre"] == "Acme Distribuciones SA"
    cliente_id = cliente["id"]

    # 2. Read (Get by ID)
    get_res = client.get(f"/api/v1/clientes/{cliente_id}", headers=vendedor_headers)
    assert get_res.status_code == 200
    assert get_res.json()["nombre"] == "Acme Distribuciones SA"
    assert "contactos" in get_res.json()
    assert "oportunidades_activas" in get_res.json()

    # 3. Update
    update_res = client.put(
        f"/api/v1/clientes/{cliente_id}",
        headers=vendedor_headers,
        json={"num_empleados": 400, "segmento": "Enterprise"},
    )
    assert update_res.status_code == 200
    assert update_res.json()["num_empleados"] == 400
    assert update_res.json()["segmento"] == "Enterprise"

    # 4. Delete
    delete_res = client.delete(f"/api/v1/clientes/{cliente_id}", headers=vendedor_headers)
    assert delete_res.status_code == 200

    # 5. Verify deleted
    assert client.get(f"/api/v1/clientes/{cliente_id}", headers=vendedor_headers).status_code == 404


def test_cliente_search(client, vendedor_headers):
    client.post(
        "/api/v1/clientes/",
        headers=vendedor_headers,
        json={"nombre": "Corporación Alfa Monterrey", "industria": "Manufactura"},
    )
    client.post(
        "/api/v1/clientes/",
        headers=vendedor_headers,
        json={"nombre": "Beta Servicios Guadalajara", "industria": "Servicios"},
    )

    # Search for "Alfa"
    search_res = client.get("/api/v1/clientes/?search=Alfa", headers=vendedor_headers)
    assert search_res.status_code == 200
    items = search_res.json()["items"]
    assert len(items) == 1
    assert "Alfa" in items[0]["nombre"]


def test_cliente_stats(client, vendedor_headers):
    # Create cliente
    cli_res = client.post(
        "/api/v1/clientes/",
        headers=vendedor_headers,
        json={"nombre": "Stats Test Client", "segmento": "SMB"},
    )
    cliente_id = cli_res.json()["id"]

    # Create 1 open opp ($20,000)
    client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Opp 1 Abierta",
            "cliente_id": cliente_id,
            "etapa": "prospeccion",
            "valor_estimado_usd": 20000.0,
        },
    )

    # Create 1 won opp ($30,000)
    client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Opp 2 Ganada",
            "cliente_id": cliente_id,
            "etapa": "ganado",
            "valor_estimado_usd": 30000.0,
        },
    )

    # Get stats
    stats_res = client.get(f"/api/v1/clientes/{cliente_id}/stats", headers=vendedor_headers)
    assert stats_res.status_code == 200
    stats = stats_res.json()
    assert stats["total_oportunidades"] == 2
    assert stats["valor_pipeline"] == 20000.0
    assert stats["valor_ganado"] == 30000.0
    assert stats["win_rate"] == 100.0  # 1 won, 0 lost
