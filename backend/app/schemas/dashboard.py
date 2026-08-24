from datetime import date
from typing import Optional
from pydantic import BaseModel


class DashboardSummary(BaseModel):
    pipeline_total_usd: float
    pipeline_ponderado_usd: float
    oportunidades_abiertas: int
    oportunidades_ganadas_mes: int
    oportunidades_perdidas_mes: int
    valor_ganado_mes_usd: float
    win_rate_mes: float
    ticket_promedio_usd: float
    velocidad_promedio_dias: float


class PipelinePorEtapa(BaseModel):
    etapa: str
    count: int
    valor_total_usd: float
    valor_ponderado_usd: float


class PipelinePorVendedor(BaseModel):
    vendedor: str
    count: int
    valor_total_usd: float
    win_rate: float


class PipelinePorFabricante(BaseModel):
    fabricante: str
    count: int
    valor_total_usd: float


class ForecastResponse(BaseModel):
    periodo: str
    fecha_inicio: date
    fecha_fin: date
    pipeline_en_periodo: float
    forecast_ponderado: float
    ganado_a_la_fecha: float
    meta_estimada: Optional[float] = None


class WinLossTrendItem(BaseModel):
    mes: str
    ganadas: int
    perdidas: int
    valor_ganado_usd: float
