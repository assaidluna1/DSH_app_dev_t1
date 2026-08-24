from datetime import date


def test_forecast_calculations(client, vendedor_headers):
    # 1. Create client
    cli_res = client.post(
        "/api/v1/clientes/",
        headers=vendedor_headers,
        json={"nombre": "Forecast Test Client", "segmento": "SMB"},
    )
    cliente_id = cli_res.json()["id"]

    today = date.today()

    # Create open opp with 50% probability ($10,000 -> weighted = $5,000)
    client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Opp 1 Forecast",
            "cliente_id": cliente_id,
            "etapa": "propuesta_tecnica",
            "valor_estimado_usd": 10000.0,
            "probabilidad": 50.0,
            "fecha_cierre_estimada": today.isoformat(),
        },
    )

    # Create open opp with 20% probability ($20,000 -> weighted = $4,000)
    client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Opp 2 Forecast",
            "cliente_id": cliente_id,
            "etapa": "calificacion",
            "valor_estimado_usd": 20000.0,
            "probabilidad": 20.0,
            "fecha_cierre_estimada": today.isoformat(),
        },
    )

    # Create won opp ($15,000)
    client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Opp 3 Won",
            "cliente_id": cliente_id,
            "etapa": "ganado",
            "valor_estimado_usd": 15000.0,
            "probabilidad": 100.0,
            "fecha_cierre_estimada": today.isoformat(),
        },
    )

    # Check forecast for month
    res = client.get("/api/v1/dashboard/forecast?periodo=mes", headers=vendedor_headers)
    assert res.status_code == 200
    data = res.json()

    # Open pipeline = 10k + 20k + 15k won = 45k in period
    assert data["pipeline_en_periodo"] == 45000.0
    # Weighted forecast = 5000 + 4000 = 9000.0
    assert data["forecast_ponderado"] == 9000.0
    # Won in period = 15000.0
    assert data["ganado_a_la_fecha"] == 15000.0


def test_win_rate_calculation(client, vendedor_headers):
    # Summary calculates monthly win rate
    summary_res = client.get("/api/v1/dashboard/summary", headers=vendedor_headers)
    assert summary_res.status_code == 200
    summary = summary_res.json()
    
    ganadas = summary["oportunidades_ganadas_mes"]
    perdidas = summary["oportunidades_perdidas_mes"]
    total = ganadas + perdidas
    
    if total > 0:
        expected_win_rate = round((ganadas / total) * 100.0, 2)
        assert summary["win_rate_mes"] == expected_win_rate
    else:
        assert summary["win_rate_mes"] == 0.0
