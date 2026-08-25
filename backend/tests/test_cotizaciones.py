def test_create_and_list_cotizaciones(client, vendedor_headers):
    """T-05: CRUD for cotizaciones module."""
    cli_res = client.post(
        "/api/v1/clientes/",
        headers=vendedor_headers,
        json={"nombre": "Cotizacion Test Client", "segmento": "Enterprise"},
    )
    cliente_id = cli_res.json()["id"]

    opp_res = client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Opp for Cotizacion",
            "cliente_id": cliente_id,
            "etapa": "propuesta_comercial",
            "valor_estimado_usd": 100000.0,
        },
    )
    opp_id = opp_res.json()["id"]

    res = client.post(
        "/api/v1/cotizaciones/",
        headers=vendedor_headers,
        json={
            "oportunidad_id": opp_id,
            "numero": "COT-2026-001",
            "subtotal_usd": 85000.0,
            "descuento_pct": 10.0,
            "total_usd": 76500.0,
            "estado": "borrador",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["numero"] == "COT-2026-001"
    assert float(data["total_usd"]) == 76500.0
    assert data["estado"] == "borrador"
    cot_id = data["id"]

    list_res = client.get("/api/v1/cotizaciones/", headers=vendedor_headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] >= 1

    get_res = client.get(f"/api/v1/cotizaciones/{cot_id}", headers=vendedor_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == cot_id

    put_res = client.put(
        f"/api/v1/cotizaciones/{cot_id}",
        headers=vendedor_headers,
        json={"estado": "enviada"},
    )
    assert put_res.status_code == 200
    assert put_res.json()["estado"] == "enviada"

    not_found = client.get(f"/api/v1/cotizaciones/{opp_id}", headers=vendedor_headers)
    assert not_found.status_code == 404
