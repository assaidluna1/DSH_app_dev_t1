import React, { useState, useEffect } from 'react';

export const ClienteForm = ({ initialData = null, onSubmit, onCancel, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    industria: '',
    num_empleados: '',
    ciudad: '',
    pais: 'México',
    segmento: 'SMB',
    website: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        industria: initialData.industria || '',
        num_empleados: initialData.num_empleados || '',
        ciudad: initialData.ciudad || '',
        pais: initialData.pais || 'México',
        segmento: initialData.segmento || 'SMB',
        website: initialData.website || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      num_empleados: formData.num_empleados ? parseInt(formData.num_empleados) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-semibold text-slate-300 mb-1">Nombre de la Empresa *</label>
        <input
          type="text"
          required
          value={formData.nombre}
          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          placeholder="Ej: Innovaciones Tecnológicas de México SA de CV"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Industria</label>
          <input
            type="text"
            value={formData.industria}
            onChange={(e) => setFormData({ ...formData, industria: e.target.value })}
            placeholder="Ej: Manufactura, Financiero, Retail"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Segmento</label>
          <select
            value={formData.segmento}
            onChange={(e) => setFormData({ ...formData, segmento: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="SMB">SMB (Pequeña/Mediana)</option>
            <option value="Mid-Market">Mid-Market</option>
            <option value="Enterprise">Enterprise (Corporativo)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Ciudad</label>
          <input
            type="text"
            value={formData.ciudad}
            onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
            placeholder="Ej: CDMX, Monterrey, Guadalajara"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Número de Empleados</label>
          <input
            type="number"
            min="1"
            value={formData.num_empleados}
            onChange={(e) => setFormData({ ...formData, num_empleados: e.target.value })}
            placeholder="Ej: 250"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold text-slate-300 mb-1">Sitio Web</label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          placeholder="https://empresa.com.mx"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

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
          {isSubmitting ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Registrar Empresa'}
        </button>
      </div>
    </form>
  );
};
