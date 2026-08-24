import uuid
from app.models.actividad import Actividad
from app.models.nota import Nota


def create_sample_cliente(client, headers):
    res = client.post(
        "/api/v1/clientes/",
        headers=headers,
        json={
            "nombre": "Empresa Test SA",
            "industria": "Financiero",
            "segmento": "Mid-Market",
            "ciudad": "CDMX",
        },
    )
    assert res.status_code == 201
    return res.json()["id"]


def test_create_and_list_oportunidades(client, vendedor_headers):
    cliente_id = create_sample_cliente(client, vendedor_headers)

    # Create opportunity
    res = client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Renovación Servidores Datacenter",
            "cliente_id": cliente_id,
            "etapa": "prospeccion",
            "valor_estimado_usd": 50000.0,
            "probabilidad": 20.0,
            "prioridad": "alta",
        },
    )
    assert res.status_code == 201
    data = res.json()
    assert data["nombre"] == "Renovación Servidores Datacenter"
    assert float(data["valor_estimado_usd"]) == 50000.0
    assert float(data["probabilidad"]) == 20.0
    opp_id = data["id"]

    # List opportunities
    list_res = client.get("/api/v1/oportunidades/", headers=vendedor_headers)
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert "items" in list_data
    assert list_data["total"] >= 1
    assert any(item["id"] == opp_id for item in list_data["items"])


def test_get_oportunidad_by_id(client, vendedor_headers):
    cliente_id = create_sample_cliente(client, vendedor_headers)
    res = client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Switching Core",
            "cliente_id": cliente_id,
            "etapa": "calificacion",
            "valor_estimado_usd": 30000.0,
        },
    )
    opp_id = res.json()["id"]

    # Get by ID
    get_res = client.get(f"/api/v1/oportunidades/{opp_id}", headers=vendedor_headers)
    assert get_res.status_code == 200
    assert get_res.json()["id"] == opp_id
    assert "actividades" in get_res.json()
    assert "notas" in get_res.json()

    # Get non-existent
    non_existent = str(uuid.uuid4())
    not_found = client.get(f"/api/v1/oportunidades/{non_existent}", headers=vendedor_headers)
    assert not_found.status_code == 404


def test_stage_update_business_rules(client, vendedor_headers):
    cliente_id = create_sample_cliente(client, vendedor_headers)
    res = client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Cloud Storage Migration",
            "cliente_id": cliente_id,
            "etapa": "propuesta_tecnica",
            "valor_estimado_usd": 80000.0,
            "probabilidad": 50.0,
        },
    )
    opp_id = res.json()["id"]

    # Update to 'ganado' -> probability must become 100
    patch_ganado = client.patch(
        f"/api/v1/oportunidades/{opp_id}/etapa",
        headers=vendedor_headers,
        json={"etapa": "ganado"},
    )
    assert patch_ganado.status_code == 200
    assert float(patch_ganado.json()["probabilidad"]) == 100.0

    # Update to 'perdido' with reason -> probability must become 0
    patch_perdido = client.patch(
        f"/api/v1/oportunidades/{opp_id}/etapa",
        headers=vendedor_headers,
        json={"etapa": "perdido", "motivo_perdida": "precio"},
    )
    assert patch_perdido.status_code == 200
    assert float(patch_perdido.json()["probabilidad"]) == 0.0
    assert patch_perdido.json()["motivo_perdida"] == "precio"


def test_activities_and_notes_with_cascade_delete(client, db_session, vendedor_headers):
    cliente_id = create_sample_cliente(client, vendedor_headers)
    res = client.post(
        "/api/v1/oportunidades/",
        headers=vendedor_headers,
        json={
            "nombre": "Seguridad Perimetral Fortinet",
            "cliente_id": cliente_id,
            "etapa": "propuesta_comercial",
            "valor_estimado_usd": 45000.0,
        },
    )
    opp_id = res.json()["id"]

    # Add activity
    act_res = client.post(
        f"/api/v1/oportunidades/{opp_id}/actividades",
        headers=vendedor_headers,
        json={
            "oportunidad_id": opp_id,
            "tipo": "demo",
            "titulo": "Demo de producto en vivo",
            "duracion_min": 60,
            "resultado": "Excelente recepción",
        },
    )
    assert act_res.status_code == 201
    act_id = act_res.json()["id"]

    # Add note
    nota_res = client.post(
        f"/api/v1/oportunidades/{opp_id}/notas",
        headers=vendedor_headers,
        json={"contenido": "Cliente tiene presupuesto asignado para Q2."},
    )
    assert nota_res.status_code == 201
    nota_id = nota_res.json()["id"]

    # Verify activities & notes are listed on opportunity
    opp_detail = client.get(f"/api/v1/oportunidades/{opp_id}", headers=vendedor_headers).json()
    assert len(opp_detail["actividades"]) == 1
    assert len(opp_detail["notas"]) == 1

    # Delete opportunity
    del_res = client.delete(f"/api/v1/oportunidades/{opp_id}", headers=vendedor_headers)
    assert del_res.status_code == 200

    # Verify opportunity is deleted
    assert client.get(f"/api/v1/oportunidades/{opp_id}", headers=vendedor_headers).status_code == 404

    # Verify cascade deletion of activity and note
    act_in_db = db_session.query(Actividad).filter(Actividad.id == uuid.UUID(act_id)).first()
    nota_in_db = db_session.query(Nota).filter(Nota.id == uuid.UUID(nota_id)).first()
    assert act_in_db is None
    assert nota_in_db is None
