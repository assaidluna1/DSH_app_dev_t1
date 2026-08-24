import calendar
from datetime import date, datetime
from typing import Tuple
from sqlalchemy.orm import Session
from app.models.oportunidad import Oportunidad
from app.schemas.dashboard import ForecastResponse


def get_period_dates(periodo: str) -> Tuple[date, date]:
    today = date.today()
    if periodo == "trimestre":
        quarter = (today.month - 1) // 3
        start_month = quarter * 3 + 1
        end_month = start_month + 2
        _, last_day = calendar.monthrange(today.year, end_month)
        start_date = date(today.year, start_month, 1)
        end_date = date(today.year, end_month, last_day)
    elif periodo == "año":
        start_date = date(today.year, 1, 1)
        end_date = date(today.year, 12, 31)
    else:  # "mes" default
        _, last_day = calendar.monthrange(today.year, today.month)
        start_date = date(today.year, today.month, 1)
        end_date = date(today.year, today.month, last_day)

    return start_date, end_date


def get_forecast(db: Session, periodo: str = "mes") -> ForecastResponse:
    start_date, end_date = get_period_dates(periodo)

    opps = db.query(Oportunidad).filter(
        Oportunidad.fecha_cierre_estimada >= start_date,
        Oportunidad.fecha_cierre_estimada <= end_date,
    ).all()

    pipeline_en_periodo = float(sum(
        opp.valor_estimado_usd or 0
        for opp in opps
        if opp.etapa != "perdido"
    ))

    forecast_ponderado = float(sum(
        float(opp.valor_estimado_usd or 0) * (float(opp.probabilidad or 0) / 100.0)
        for opp in opps
        if opp.etapa not in ["ganado", "perdido"]
    ))

    ganado_a_la_fecha = float(sum(
        opp.valor_estimado_usd or 0
        for opp in opps
        if opp.etapa == "ganado"
    ))

    return ForecastResponse(
        periodo=periodo,
        fecha_inicio=start_date,
        fecha_fin=end_date,
        pipeline_en_periodo=round(pipeline_en_periodo, 2),
        forecast_ponderado=round(forecast_ponderado, 2),
        ganado_a_la_fecha=round(ganado_a_la_fecha, 2),
        meta_estimada=None,
    )
