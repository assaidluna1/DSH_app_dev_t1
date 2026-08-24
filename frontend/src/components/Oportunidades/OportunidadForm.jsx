import React, { useState, useEffect } from 'react';
import { clientesApi } from '../../api/clientes';

export const OportunidadForm = ({ initialData = null, onSubmit, onCancel, isSubmitting = false }) => {
  const [clientes, setClientes] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    cliente_id: '',
    etapa: 'prospeccion',
    valor_estimado_usd: 0,
    probabilidad: 10,
    fecha_cierre_estimada: '',
    prioridad: 'media',
    origen: 'inbound',
    descripcion: '',
    motivo_perdida: '',
  });

  useEffect(() => {
    // Load clients for dropdown
    const loadClientes = async () => {
      try {
        const res = await clientesApi.list({ size: 100 });
        setClientes(res.items || []);
        if (!initialData && res.items?.length > 0 && !formData.cliente_id) {
          setFormData((prev) => ({ ...prev, cliente_id: res.items[0].id }));
        }
      } catch (err) {
        console.error('Error loading clientes:', err);
      }
    };
    loadClientes();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        cliente_id: initialData.cliente_id || '',
        etapa: initialData.etapa || 'prospeccion',
        valor_estimado_usd: initialData.valor_estimado_usd || 0,
        probabilidad: initialData.probabilidad || 10,
        fecha_cierre_estimada: initialData.fecha_cierre_estimada || '',
        prioridad: initialData.prioridad || 'media',
        origen: initialData.origen || 'inbound',
        descripcion: initialData.descripcion || '',
        motivo_perdida: initialData.motivo_perdida || '',
      });
    }
  }, [initialData]);

  const handleStageChange = (newStage) => {
    let prob = formData.probabilidad;
    if (newStage === 'ganado') prob = 100;
    else if (newStage === 'perdido') prob = 0;
    else if (newStage === 'prospeccion') prob = 10;
    else if (newStage === 'calificacion') prob = 25;
    else if (newStage === 'propuesta_tecnica') prob = 50;
    else if (newStage === 'propuesta_comercial') prob = 70;
    else if (newStage === 'negociacion') prob = 85;

    setFormData((prev) => ({
      ...prev,
      etapa: newStage,
      probabilidad: prob,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      valor_estimado_usd: parseFloat(formData.valor_estimado_usd) || 0,
      probabilidad: parseFloat(formData.probabilidad) || 0,
      fecha_cierre_estimada: formData.fecha_cierre_estimada || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* Nombre */}
      <div>
        <label className="block font-semibold text-slate-300 mb-1">Nombre de la Oportunidad *</label>
        <input
          type="text"
          required
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ej: Renovación Datacenter Monterrey"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Cliente */}
      <div>
        <label className="block font-semibold text-slate-300 mb-1">Cliente *</label>
        <select
          required
          value={formData.cliente_id}
          onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">Seleccione una empresa...</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre} ({c.segmento})
            </option>
          ))}
        </select>
      </div>

      {/* Grid: Etapa & Prioridad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Etapa</label>
          <select
            value={formData.etapa}
            onChange={(e) => handleStageChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="prospeccion">Prospección</option>
            <option value="calificacion">Calificación</option>
            <option value="propuesta_tecnica">Propuesta Técnica</option>
            <option value="propuesta_comercial">Propuesta Comercial</option>
            <option value="negociacion">Negociación</option>
            <option value="ganado">Ganado (100% prob)</option>
            <option value="perdido">Perdido (0% prob)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Prioridad</label>
          <select
            value={formData.prioridad}
            onChange={(e) => setFormData({ ...formData, prioridad: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>

      {/* Grid: Valor USD & Probabilidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Valor Estimado (USD) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={formData.valor_estimado_usd}
            onChange={(e) => setFormData({ ...formData, valor_estimado_usd: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Probabilidad (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.probabilidad}
            onChange={(e) => setFormData({ ...formData, probabilidad: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Grid: Fecha Cierre & Origen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Fecha Cierre Estimada</label>
          <input
            type="date"
            value={formData.fecha_cierre_estimada}
            onChange={(e) => setFormData({ ...formData, fecha_cierre_estimada: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Origen del Lead</label>
          <select
            value={formData.origen}
            onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
            <option value="referido">Referido</option>
            <option value="renovacion">Renovación</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      {/* Motivo de pérdida (if perdido) */}
      {formData.etapa === 'perdido' && (
        <div>
          <label className="block font-semibold text-rose-300 mb-1">Motivo de Pérdida</label>
          <input
            type="text"
            value={formData.motivo_perdida}
            onChange={(e) => setFormData({ ...formData, motivo_perdida: e.target.value })}
            placeholder="Ej: Precio, competidor, falta de presupuesto..."
            className="w-full bg-slate-950 border border-rose-800/60 rounded-xl px-3.5 py-2.5 text-rose-200 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      )}

      {/* Descripcion */}
      <div>
        <label className="block font-semibold text-slate-300 mb-1">Descripción / Notas Iniciales</label>
        <textarea
          rows="3"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Alcance del proyecto, requerimientos técnicos, etc."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 font-semibold transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-600/25 disabled:opacity-50 transition-all"
        >
          {isSubmitting ? 'Guardando...' : initialData ? 'Actualizar Oportunidad' : 'Crear Oportunidad'}
        </button>
      </div>
    </form>
  );
};
