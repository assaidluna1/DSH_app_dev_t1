import React, { useState, useEffect } from 'react';
import { oportunidadesApi } from '../api/oportunidades';
import { OportunidadTable } from '../components/Oportunidades/OportunidadTable';
import { OportunidadForm } from '../components/Oportunidades/OportunidadForm';
import { OportunidadDetail } from '../components/Oportunidades/OportunidadDetail';
import { Modal } from '../components/Shared/Modal';
import { LoadingSpinner } from '../components/Shared/LoadingSpinner';
import { Plus, Search, Filter, RefreshCw, X } from 'lucide-react';
import { stageLabels } from '../components/Shared/Badge';

export const Oportunidades = () => {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    etapa: '',
    prioridad: '',
    page: 1,
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [selectedOppId, setSelectedOppId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOportunidades = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        size: 20,
        search: filters.search || undefined,
        etapa: filters.etapa || undefined,
        prioridad: filters.prioridad || undefined,
      };
      const res = await oportunidadesApi.list(params);
      setData(res);
    } catch (err) {
      console.error('Error fetching oportunidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOportunidades();
  }, [filters]);

  const handleCreate = async (formData) => {
    try {
      setIsSubmitting(true);
      await oportunidadesApi.create(formData);
      setIsCreateModalOpen(false);
      await fetchOportunidades();
    } catch (err) {
      console.error('Error creating opportunity:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      await oportunidadesApi.update(editingOpp.id, formData);
      setEditingOpp(null);
      await fetchOportunidades();
    } catch (err) {
      console.error('Error updating opportunity:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Confirma que desea eliminar esta oportunidad comercial?')) return;
    try {
      await oportunidadesApi.delete(id);
      await fetchOportunidades();
    } catch (err) {
      console.error('Error deleting opportunity:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Oportunidades Comerciales</h2>
          <p className="text-xs text-slate-400 mt-1">Directorio consolidado y control detallado de operaciones</p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Oportunidad</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            placeholder="Buscar por oportunidad, descripción o cliente..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Stage Filter */}
        <select
          value={filters.etapa}
          onChange={(e) => setFilters({ ...filters, etapa: e.target.value, page: 1 })}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">Todas las etapas</option>
          {Object.entries(stageLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={filters.prioridad}
          onChange={(e) => setFilters({ ...filters, prioridad: e.target.value, page: 1 })}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>

        {(filters.search || filters.etapa || filters.prioridad) && (
          <button
            onClick={() => setFilters({ search: '', etapa: '', prioridad: '', page: 1 })}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Cargando oportunidades..." />
      ) : (
        <OportunidadTable
          oportunidades={data.items}
          total={data.total}
          page={data.page}
          size={data.size}
          pages={data.pages}
          onPageChange={(p) => setFilters({ ...filters, page: p })}
          onSelectOpportunity={(id) => setSelectedOppId(id)}
          onEditOpportunity={(opp) => setEditingOpp(opp)}
          onDeleteOpportunity={handleDelete}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Oportunidad Comercial"
      >
        <OportunidadForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingOpp}
        onClose={() => setEditingOpp(null)}
        title="Editar Oportunidad Comercial"
      >
        {editingOpp && (
          <OportunidadForm
            initialData={editingOpp}
            onSubmit={handleUpdate}
            onCancel={() => setEditingOpp(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedOppId}
        onClose={() => setSelectedOppId(null)}
        title="Detalle de Oportunidad Comercial"
        maxWidth="max-w-3xl"
      >
        {selectedOppId && (
          <OportunidadDetail
            oportunidadId={selectedOppId}
            onClose={() => setSelectedOppId(null)}
            onUpdated={fetchOportunidades}
          />
        )}
      </Modal>
    </div>
  );
};
