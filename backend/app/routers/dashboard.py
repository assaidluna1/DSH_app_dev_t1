from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.dependencies import get_db, get_current_active_user
from app.models.actividad import Actividad
from app.schemas.actividad import ActividadSchema
from app.schemas.oportunidad import OportunidadSchema
from app.schemas.dashboard import (
    DashboardSummary,
    PipelinePorEtapa,
    PipelinePorVendedor,
    PipelinePorFabricante,
    PipelinePorFabricanteEtapa,
    ForecastResponse,
    WinLossTrendItem,
)
from app.services import dashboard_service, forecast_service

router = APIRouter(prefix="/dashboard", tags=["dashboard"], dependencies=[Depends(get_current_active_user)])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    return dashboard_service.get_summary(db)


@router.get("/pipeline-por-etapa", response_model=List[PipelinePorEtapa])
def get_pipeline_por_etapa(db: Session = Depends(get_db)):
    return dashboard_service.get_pipeline_por_etapa(db)


@router.get("/pipeline-por-vendedor", response_model=List[PipelinePorVendedor])
def get_pipeline_por_vendedor(db: Session = Depends(get_db)):
    return dashboard_service.get_pipeline_por_vendedor(db)


@router.get("/pipeline-por-fabricante", response_model=List[PipelinePorFabricante])
def get_pipeline_por_fabricante(db: Session = Depends(get_db)):
    return dashboard_service.get_pipeline_por_fabricante(db)


@router.get("/top-oportunidades", response_model=List[OportunidadSchema])
def get_top_oportunidades(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    return dashboard_service.get_top_oportunidades(db, limit=limit)


@router.get("/forecast", response_model=ForecastResponse)
def get_forecast(
    periodo: str = Query("mes", pattern="^(mes|trimestre|año)$"),
    db: Session = Depends(get_db),
):
    return forecast_service.get_forecast(db, periodo=periodo)


@router.get("/actividad-reciente", response_model=List[ActividadSchema])
def get_actividad_reciente(
    dias: int = Query(7, ge=1, le=90),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    cutoff_date = datetime.utcnow() - timedelta(days=dias)
    return (
        db.query(Actividad)
        .filter(Actividad.fecha >= cutoff_date)
        .order_by(Actividad.fecha.desc())
        .limit(limit)
        .all()
    )


@router.get("/pipeline-por-fabricante-y-etapa", response_model=List[PipelinePorFabricanteEtapa])
def get_pipeline_por_fabricante_y_etapa(db: Session = Depends(get_db)):
    return dashboard_service.get_pipeline_por_fabricante_y_etapa(db)


@router.get("/win-loss-trend", response_model=List[WinLossTrendItem])
def get_win_loss_trend(
    meses: int = Query(6, ge=1, le=24),
    db: Session = Depends(get_db),
):
    return dashboard_service.get_win_loss_trend(db, meses=meses)
