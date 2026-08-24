import React, { useState, useEffect } from 'react';
import { clientesApi } from '../api/clientes';
import { ClienteTable } from '../components/Clientes/ClienteTable';
import { ClienteForm } from '../components/Clientes/ClienteForm';
import { Modal } from '../components/Shared/Modal';
import { LoadingSpinner } from '../components/Shared/LoadingSpinner';
import { StageBadge, formatCurrency } from '../components/Shared/Badge';
import { Plus, Search, Building2, Phone, Mail, UserCheck, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

export const Clientes = () => {
  const [data, setData] = useState({ items: [], total: 0, page: 1, size: 20, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segmento, setSegmento] = useState('');
  const [page, setPage] = useState(1);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);
  const [selectedClienteDetail, setSelectedClienteDetail] = useState(null);
  const [clienteStats, setClienteStats] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const res = await clientesApi.list({
        page,
        size: 20,
        search: search || undefined,
        segmento: segmento || undefined,
      });
      setData(res);
    } catch (err) {
      console.error('Error fetching clientes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [search, segmento, page]);

  const handleSelectCliente = async (id) => {
    try {
      const [detail, stats] = await Promise.all([
        clientesApi.get(id),
        clientesApi.getStats(id),
      ]);
      setSelectedClienteDetail(detail);
      setClienteStats(stats);
    } catch (err) {
      console.error('Error fetching cliente detail:', err);
    }
  };

  const handleCreate = async (formData) => {
    try {
      setIsSubmitting(true);
      await clientesApi.create(formData);
      setIsCreateOpen(false);
      await fetchClientes();
    } catch (err) {
      console.error('Error creating cliente:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (formData) => {
    try {
      setIsSubmitting(true);
      await clientesApi.update(editingCliente.id, formData);
      setEditingCliente(null);
      await fetchClientes();
    } catch (err) {
      console.error('Error updating cliente:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Confirma que desea eliminar este cliente y todos sus contactos asociados?')) return;
    try {
      await clientesApi.delete(id);
      await fetchClientes();
    } catch (err) {
      console.error('Error deleting cliente:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Directorio de Clientes</h2>
          <p className="text-xs text-slate-400 mt-1">Cuentas corporativas, perfil empresarial y valor comercial</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar por empresa, industria o ciudad..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <select
          value={segmento}
          onChange={(e) => { setSegmento(e.target.value); setPage(1); }}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">Todos los segmentos</option>
          <option value="SMB">SMB</option>
          <option value="Mid-Market">Mid-Market</option>
          <option value="Enterprise">Enterprise</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Cargando empresas..." />
      ) : (
        <ClienteTable
          clientes={data.items}
          total={data.total}
          page={data.page}
          size={data.size}
          pages={data.pages}
          onPageChange={setPage}
          onSelectCliente={handleSelectCliente}
          onEditCliente={setEditingCliente}
          onDeleteCliente={handleDelete}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Registrar Nuevo Cliente"
      >
        <ClienteForm
          onSubmit={handleCreate}
          onCancel={() => setIsCreateOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingCliente}
        onClose={() => setEditingCliente(null)}
        title="Editar Datos de Cliente"
      >
        {editingCliente && (
          <ClienteForm
            initialData={editingCliente}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCliente(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedClienteDetail}
        onClose={() => setSelectedClienteDetail(null)}
        title="Ficha Ejecutiva de Cuenta"
        maxWidth="max-w-3xl"
      >
        {selectedClienteDetail && (
          <div className="space-y-6 text-xs">
            {/* Header with stats */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-100">{selectedClienteDetail.nombre}</h3>
                <p className="text-slate-400 mt-0.5">
                  {selectedClienteDetail.industria || 'Industria no especificada'} • {selectedClienteDetail.ciudad}, {selectedClienteDetail.pais}
                </p>
              </div>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                {selectedClienteDetail.segmento}
              </span>
            </div>

            {/* Stats Row */}
            {clienteStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Total Opps</span>
                  <p className="text-lg font-bold text-slate-100 mt-0.5">{clienteStats.total_oportunidades}</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Pipeline Activo</span>
                  <p className="text-lg font-bold text-blue-400 mt-0.5">{formatCurrency(clienteStats.valor_pipeline)}</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Valor Ganado</span>
                  <p className="text-lg font-bold text-emerald-400 mt-0.5">{formatCurrency(clienteStats.valor_ganado)}</p>
                </div>
                <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Win Rate</span>
                  <p className="text-lg font-bold text-purple-400 mt-0.5">{clienteStats.win_rate}%</p>
                </div>
              </div>
            )}

            {/* Contactos */}
            <div>
              <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400" /> Contactos Asociados ({selectedClienteDetail.contactos?.length || 0})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedClienteDetail.contactos?.map((c) => (
                  <div key={c.id} className="bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-200">{c.nombre} {c.apellido || ''}</p>
                      {c.es_decision_maker && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Decision Maker
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">{c.cargo || 'Sin cargo especificado'}</p>
                    <div className="mt-2 space-y-1 text-slate-300 text-[11px]">
                      {c.email && <p className="truncate">✉ {c.email}</p>}
                      {c.telefono && <p>📞 {c.telefono}</p>}
                    </div>
                  </div>
                ))}
                {(!selectedClienteDetail.contactos || selectedClienteDetail.contactos.length === 0) && (
                  <p className="col-span-2 text-slate-500 py-4 text-center">No hay contactos registrados.</p>
                )}
              </div>
            </div>

            {/* Active Opportunities */}
            <div>
              <h4 className="font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Oportunidades Activas ({selectedClienteDetail.oportunidades_activas?.length || 0})
              </h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Oportunidad</th>
                      <th className="py-2.5 px-3">Etapa</th>
                      <th className="py-2.5 px-3 text-right">Valor USD</th>
                      <th className="py-2.5 px-3 text-center">Prob.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
                    {selectedClienteDetail.oportunidades_activas?.map((opp) => (
                      <tr key={opp.id}>
                        <td className="py-2.5 px-3 font-semibold text-slate-100">{opp.nombre}</td>
                        <td className="py-2.5 px-3"><StageBadge etapa={opp.etapa} /></td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-100">{formatCurrency(opp.valor_estimado_usd)}</td>
                        <td className="py-2.5 px-3 text-center text-blue-400 font-semibold">{Math.round(opp.probabilidad)}%</td>
                      </tr>
                    ))}
                    {(!selectedClienteDetail.oportunidades_activas || selectedClienteDetail.oportunidades_activas.length === 0) && (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-500">No hay oportunidades abiertas actualmente.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
