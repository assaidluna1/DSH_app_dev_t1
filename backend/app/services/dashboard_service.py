from datetime import datetime, timedelta
from typing import List
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.oportunidad import Oportunidad
from app.models.user import User
from app.models.fabricante import Fabricante
from app.models.producto import Producto
from app.models.oportunidad_producto import OportunidadProducto
from app.schemas.dashboard import (
    DashboardSummary,
    PipelinePorEtapa,
    PipelinePorVendedor,
    PipelinePorFabricante,
    WinLossTrendItem,
)

ALL_ETAPAS = [
    "prospeccion",
    "calificacion",
    "propuesta_tecnica",
    "propuesta_comercial",
    "negociacion",
    "ganado",
    "perdido",
]


def get_summary(db: Session) -> DashboardSummary:
    now = datetime.utcnow()
    inicio_mes = datetime(now.year, now.month, 1)

    # Open opportunities
    open_opps = db.query(Oportunidad).filter(~Oportunidad.etapa.in_(["ganado", "perdido"])).all()
    pipeline_total_usd = float(sum(opp.valor_estimado_usd or 0 for opp in open_opps))
    pipeline_ponderado_usd = float(sum(
        float(opp.valor_estimado_usd or 0) * (float(opp.probabilidad or 0) / 100.0)
        for opp in open_opps
    ))
    oportunidades_abiertas = len(open_opps)

    # Monthly won / lost
    ganadas_mes_opps = db.query(Oportunidad).filter(
        Oportunidad.etapa == "ganado",
        Oportunidad.updated_at >= inicio_mes
    ).all()
    perdidas_mes_opps = db.query(Oportunidad).filter(
        Oportunidad.etapa == "perdido",
        Oportunidad.updated_at >= inicio_mes
    ).all()

    oportunidades_ganadas_mes = len(ganadas_mes_opps)
    oportunidades_perdidas_mes = len(perdidas_mes_opps)
    valor_ganado_mes_usd = float(sum(opp.valor_estimado_usd or 0 for opp in ganadas_mes_opps))

    total_cerradas_mes = oportunidades_ganadas_mes + oportunidades_perdidas_mes
    win_rate_mes = (
        round((oportunidades_ganadas_mes / total_cerradas_mes) * 100.0, 2)
        if total_cerradas_mes > 0
        else 0.0
    )

    # Average ticket on won deals (or all if none)
    all_ganadas = db.query(Oportunidad).filter(Oportunidad.etapa == "ganado").all()
    if all_ganadas:
        ticket_promedio_usd = float(sum(opp.valor_estimado_usd or 0 for opp in all_ganadas) / len(all_ganadas))
        # Velocidad en días
        total_dias = sum((opp.updated_at - opp.created_at).total_seconds() / 86400.0 for opp in all_ganadas)
        velocidad_promedio_dias = round(total_dias / len(all_ganadas), 1)
    else:
        all_opps = db.query(Oportunidad).all()
        ticket_promedio_usd = (
            float(sum(opp.valor_estimado_usd or 0 for opp in all_opps) / len(all_opps))
            if all_opps
            else 0.0
        )
        velocidad_promedio_dias = 0.0

    return DashboardSummary(
        pipeline_total_usd=round(pipeline_total_usd, 2),
        pipeline_ponderado_usd=round(pipeline_ponderado_usd, 2),
        oportunidades_abiertas=oportunidades_abiertas,
        oportunidades_ganadas_mes=oportunidades_ganadas_mes,
        oportunidades_perdidas_mes=oportunidades_perdidas_mes,
        valor_ganado_mes_usd=round(valor_ganado_mes_usd, 2),
        win_rate_mes=win_rate_mes,
        ticket_promedio_usd=round(ticket_promedio_usd, 2),
        velocidad_promedio_dias=velocidad_promedio_dias,
    )


def get_pipeline_por_etapa(db: Session) -> List[PipelinePorEtapa]:
    opps = db.query(Oportunidad).all()
    result = []
    
    for etapa in ALL_ETAPAS:
        etapa_opps = [o for o in opps if o.etapa == etapa]
        total_valor = float(sum(o.valor_estimado_usd or 0 for o in etapa_opps))
        total_ponderado = float(sum(
            float(o.valor_estimado_usd or 0) * (float(o.probabilidad or 0) / 100.0)
            for o in etapa_opps
        ))
        result.append(PipelinePorEtapa(
            etapa=etapa,
            count=len(etapa_opps),
            valor_total_usd=round(total_valor, 2),
            valor_ponderado_usd=round(total_ponderado, 2)
        ))
    return result


def get_pipeline_por_vendedor(db: Session) -> List[PipelinePorVendedor]:
    vendedores = db.query(User).filter(User.rol.in_(["vendedor", "admin"])).all()
    result = []
    
    for v in vendedores:
        opps = db.query(Oportunidad).filter(Oportunidad.propietario_id == v.id).all()
        if not opps:
            continue
        total_val = float(sum(o.valor_estimado_usd or 0 for o in opps))
        ganadas = len([o for o in opps if o.etapa == "ganado"])
        perdidas = len([o for o in opps if o.etapa == "perdido"])
        cerradas = ganadas + perdidas
        win_rate = round((ganadas / cerradas) * 100.0, 2) if cerradas > 0 else 0.0
        
        result.append(PipelinePorVendedor(
            vendedor=v.nombre,
            count=len(opps),
            valor_total_usd=round(total_val, 2),
            win_rate=win_rate
        ))
    return sorted(result, key=lambda x: x.valor_total_usd, reverse=True)


def get_pipeline_por_fabricante(db: Session) -> List[PipelinePorFabricante]:
    fabricantes = db.query(Fabricante).all()
    result = []
    
    for fab in fabricantes:
        # Join oportunidad_productos with productos and oportunidades
        items = (
            db.query(OportunidadProducto)
            .join(Producto, OportunidadProducto.producto_id == Producto.id)
            .filter(Producto.fabricante_id == fab.id)
            .all()
        )
        if not items:
            continue
        
        count = len(items)
        valor_total = float(sum(
            float(item.precio_unitario_usd or item.producto.precio_lista_usd or 0) * item.cantidad
            for item in items
        ))
        result.append(PipelinePorFabricante(
            fabricante=fab.nombre,
            count=count,
            valor_total_usd=round(valor_total, 2)
        ))
    
    return sorted(result, key=lambda x: x.valor_total_usd, reverse=True)


def get_pipeline_por_fabricante_y_etapa(db: Session) -> list:
    """Pipeline cruzado fabricante × etapa con JOIN sobre productos y fabricantes."""
    from app.schemas.dashboard import PipelinePorFabricanteEtapa
    
    rows = (
        db.query(
            Fabricante.nombre,
            Oportunidad.etapa,
            func.count(OportunidadProducto.id),
            func.sum(
                func.coalesce(OportunidadProducto.precio_unitario_usd, Producto.precio_lista_usd, 0) * OportunidadProducto.cantidad
            ),
            func.sum(
                func.coalesce(OportunidadProducto.precio_unitario_usd, Producto.precio_lista_usd, 0)
                * OportunidadProducto.cantidad
                * (func.coalesce(Oportunidad.probabilidad, 0) / 100.0)
            ),
        )
        .select_from(OportunidadProducto)
        .join(Producto, OportunidadProducto.producto_id == Producto.id)
        .join(Fabricante, Producto.fabricante_id == Fabricante.id)
        .join(Oportunidad, OportunidadProducto.oportunidad_id == Oportunidad.id)
        .group_by(Fabricante.nombre, Oportunidad.etapa)
        .order_by(Fabricante.nombre, Oportunidad.etapa)
        .all()
    )
    
    return [
        PipelinePorFabricanteEtapa(
            fabricante=row[0],
            etapa=row[1],
            count=row[2],
            valor_total_usd=round(float(row[3] or 0), 2),
            valor_ponderado_usd=round(float(row[4] or 0), 2),
        )
        for row in rows
    ]


def get_top_oportunidades(db: Session, limit: int = 10) -> List[Oportunidad]:
    return (
        db.query(Oportunidad)
        .filter(Oportunidad.etapa != "perdido")
        .order_by(Oportunidad.valor_estimado_usd.desc())
        .limit(limit)
        .all()
    )


def get_win_loss_trend(db: Session, meses: int = 6) -> List[WinLossTrendItem]:
    now = datetime.utcnow()
    result = []

    for i in range(meses - 1, -1, -1):
        # Calculate month year
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1
            
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)

        mes_str = f"{year:04d}-{month:02d}"

        ganadas = db.query(Oportunidad).filter(
            Oportunidad.etapa == "ganado",
            Oportunidad.updated_at >= start_date,
            Oportunidad.updated_at < end_date
        ).all()

        perdidas = db.query(Oportunidad).filter(
            Oportunidad.etapa == "perdido",
            Oportunidad.updated_at >= start_date,
            Oportunidad.updated_at < end_date
        ).all()

        valor_ganado = float(sum(o.valor_estimado_usd or 0 for o in ganadas))

        result.append(WinLossTrendItem(
            mes=mes_str,
            ganadas=len(ganadas),
            perdidas=len(perdidas),
            valor_ganado_usd=round(valor_ganado, 2)
        ))

    return result
