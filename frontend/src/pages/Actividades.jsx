import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../api/dashboard';
import { actividadesApi } from '../api/actividades';
import { LoadingSpinner } from '../components/Shared/LoadingSpinner';
import { 
  Activity, 
  PhoneCall, 
  Users, 
  Mail, 
  MonitorPlay, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Calendar 
} from 'lucide-react';

const activityTypeIcons = {
  llamada: PhoneCall,
  reunion: Users,
  demo: MonitorPlay,
  propuesta: FileText,
  seguimiento: Clock,
  email: Mail,
  otro: Activity,
};

const activityTypeLabels = {
  llamada: 'Llamada Telefónica',
  reunion: 'Reunión Presencial/Virtual',
  demo: 'Demostración Técnica',
  propuesta: 'Propuesta / Cotización',
  seguimiento: 'Seguimiento Comercial',
  email: 'Correo Electrónico',
  otro: 'Otra Actividad',
};

export const Actividades = () => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dias, setDias] = useState(7);
  const [tipoFilter, setTipoFilter] = useState('');

  const fetchActividades = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getActividadReciente(dias, 50);
      setActividades(data || []);
    } catch (err) {
      console.error('Error fetching actividades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActividades();
  }, [dias]);

  const filteredActividades = tipoFilter
    ? actividades.filter((a) => a.tipo === tipoFilter)
    : actividades;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Registro de Actividades</h2>
          <p className="text-xs text-slate-400 mt-1">Bitácora cronológica de interacciones, llamadas, demos y reuniones</p>
        </div>

        {/* Days selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl self-start sm:self-auto">
          {[7, 14, 30, 60].map((d) => (
            <button
              key={d}
              onClick={() => setDias(d)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                dias === d
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Últimos {d} días
            </button>
          ))}
        </div>
      </div>

      {/* Filter by Type */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setTipoFilter('')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            tipoFilter === ''
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Todas las actividades ({actividades.length})
        </button>
        {Object.entries(activityTypeLabels).map(([key, label]) => {
          const count = actividades.filter((a) => a.tipo === key).length;
          if (count === 0 && tipoFilter !== key) return null;
          return (
            <button
              key={key}
              onClick={() => setTipoFilter(key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                tipoFilter === key
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Activities Timeline */}
      {loading ? (
        <LoadingSpinner message="Cargando cronograma de actividades..." />
      ) : (
        <div className="space-y-4">
          {filteredActividades.map((act) => {
            const Icon = activityTypeIcons[act.tipo] || Activity;
            return (
              <div
                key={act.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-xl transition-all flex items-start gap-4 group"
              >
                <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                      {act.titulo}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        {act.fecha
                          ? new Date(act.fecha).toLocaleString('es-MX', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : '—'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase text-[10px] tracking-wider">
                      {act.tipo}
                    </span>
                    {act.duracion_min && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {act.duracion_min} minutos
                      </span>
                    )}
                    {act.usuario && (
                      <span className="text-slate-300">
                        Responsable: <span className="font-semibold text-slate-200">{act.usuario.nombre}</span>
                      </span>
                    )}
                  </div>

                  {act.descripcion && (
                    <p className="mt-3 text-xs text-slate-300 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                      {act.descripcion}
                    </p>
                  )}

                  {act.resultado && (
                    <div className="mt-2.5 flex items-start gap-2 text-xs text-emerald-300 bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-800/30">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-emerald-400">Resultado: </span>
                        <span>{act.resultado}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredActividades.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-medium">
              No se encontraron actividades registradas para el periodo o filtro seleccionado.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
