import React, { useState, useEffect } from 'react';
import { oportunidadesApi } from '../api/oportunidades';
import { OportunidadKanban } from '../components/Oportunidades/OportunidadKanban';
import { OportunidadForm } from '../components/Oportunidades/OportunidadForm';
import { OportunidadDetail } from '../components/Oportunidades/OportunidadDetail';
import { Modal } from '../components/Shared/Modal';
import { LoadingSpinner } from '../components/Shared/LoadingSpinner';
import { Plus, Search, Filter, RefreshCw } from 'lucide-react';

export const Pipeline = () => {
  const [oportunidades, setOportunidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOppId, setSelectedOppId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOportunidades = async () => {
    try {
      setLoading(true);
      const res = await oportunidadesApi.list({ size: 100, search: search || undefined });
      setOportunidades(res.items || []);
    } catch (err) {
      console.error('Error fetching pipeline opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOportunidades();
  }, [search]);

  const handleCreateOpportunity = async (formData) => {
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

  const handleMoveStage = async (id, newStage) => {
    try {
      await oportunidadesApi.updateEtapa(id, newStage);
      await fetchOportunidades();
    } catch (err) {
      console.error('Error moving stage:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Pipeline Comercial</h2>
          <p className="text-xs text-slate-400 mt-1">Gestión visual del avance de negocios por etapa de venta</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar oportunidad..."
              className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 w-48 sm:w-64 transition-colors"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Oportunidad</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      {loading ? (
        <LoadingSpinner message="Cargando tablero Kanban..." />
      ) : (
        <OportunidadKanban
          oportunidades={oportunidades}
          onSelectOpportunity={(id) => setSelectedOppId(id)}
          onMoveStage={handleMoveStage}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Crear Nueva Oportunidad Comercial"
      >
        <OportunidadForm
          onSubmit={handleCreateOpportunity}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={isSubmitting}
        />
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
