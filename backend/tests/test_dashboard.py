def seed_test_data(client, headers):
    # Create client
    cli_res = client.post(
        "/api/v1/clientes/",
        headers=headers,
        json={"nombre": "Dashboard Test Corp", "segmento": "Enterprise"},
    )
    cli_id = cli_res.json()["id"]

    # Create opps with different stages and values
    opps = [
        {"nombre": "Opp Prospeccion", "etapa": "prospeccion", "valor": 10000.0, "prob": 10.0},
        {"nombre": "Opp Calificacion", "etapa": "calificacion", "valor": 20000.0, "prob": 25.0},
        {"nombre": "Opp Ganada", "etapa": "ganado", "valor": 50000.0, "prob": 100.0},
        {"nombre": "Opp Perdida", "etapa": "perdido", "valor": 15000.0, "prob": 0.0},
    ]

    for o in opps:
        client.post(
            "/api/v1/oportunidades/",
            headers=headers,
            json={
                "nombre": o["nombre"],
                "cliente_id": cli_id,
                "etapa": o["etapa"],
                "valor_estimado_usd": o["valor"],
                "probabilidad": o["prob"],
            },
        )


def test_dashboard_summary(client, vendedor_headers):
    seed_test_data(client, vendedor_headers)

    res = client.get("/api/v1/dashboard/summary", headers=vendedor_headers)
    assert res.status_code == 200
    data = res.json()

    # Check mandatory fields
    assert "pipeline_total_usd" in data
    assert "pipeline_ponderado_usd" in data
    assert "oportunidades_abiertas" in data
    assert "oportunidades_ganadas_mes" in data
    assert "oportunidades_perdidas_mes" in data
    assert "valor_ganado_mes_usd" in data
    assert "win_rate_mes" in data
    assert "ticket_promedio_usd" in data
    assert "velocidad_promedio_dias" in data

    assert isinstance(data["pipeline_total_usd"], (int, float))
    assert isinstance(data["pipeline_ponderado_usd"], (int, float))
    assert data["oportunidades_abiertas"] >= 2


def test_dashboard_pipeline_por_etapa(client, vendedor_headers):
    seed_test_data(client, vendedor_headers)

    res = client.get("/api/v1/dashboard/pipeline-por-etapa", headers=vendedor_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 7  # All 7 stages
    etapas = [item["etapa"] for item in data]
    assert "prospeccion" in etapas
    assert "ganado" in etapas
    assert "perdido" in etapas


def test_dashboard_top_oportunidades(client, vendedor_headers):
    seed_test_data(client, vendedor_headers)

    res = client.get("/api/v1/dashboard/top-oportunidades?limit=5", headers=vendedor_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    # Check descending order by valor_estimado_usd
    values = [float(item["valor_estimado_usd"]) for item in data]
    assert values == sorted(values, reverse=True)


def test_dashboard_forecast(client, vendedor_headers):
    res = client.get("/api/v1/dashboard/forecast?periodo=mes", headers=vendedor_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["periodo"] == "mes"
    assert "fecha_inicio" in data
    assert "fecha_fin" in data
    assert "pipeline_en_periodo" in data
    assert "forecast_ponderado" in data
    assert "ganado_a_la_fecha" in data


def test_dashboard_win_loss_trend(client, vendedor_headers):
    res = client.get("/api/v1/dashboard/win-loss-trend?meses=3", headers=vendedor_headers)
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) == 3
    for item in data:
        assert "mes" in item
        assert "ganadas" in item
        assert "perdidas" in item
        assert "valor_ganado_usd" in item
