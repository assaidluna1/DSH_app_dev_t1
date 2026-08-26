import React, { useState, useEffect } from 'react';
import { contactosApi, clientesApi } from '../api/clientes';
import { Modal } from '../components/Shared/Modal';
import { LoadingSpinner } from '../components/Shared/LoadingSpinner';
import { Plus, Search, UserCheck, Mail, Phone, Building2, Trash2 } from 'lucide-react';

export const Contactos = () => {
  const [contactos, setContactos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClienteId, setSelectedClienteId] = useState('');

  // New contact modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    cliente_id: '',
    nombre: '',
    apellido: '',
    cargo: '',
    email: '',
    telefono: '',
    es_decision_maker: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contactsList, clientsList] = await Promise.all([
        contactosApi.list({
          search: search || undefined,
          cliente_id: selectedClienteId || undefined,
        }),
        clientesApi.list({ size: 100 }),
      ]);
      setContactos(contactsList);
      setClientes(clientsList.items || []);
    } catch (err) {
      console.error('Error fetching contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedClienteId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.cliente_id || !formData.nombre) return;
    try {
      setIsSubmitting(true);
      await contactosApi.create(formData);
      setIsCreateOpen(false);
      setFormData({
        cliente_id: '',
        nombre: '',
        apellido: '',
        cargo: '',
        email: '',
        telefono: '',
        es_decision_maker: false,
      });
      await fetchData();
    } catch (err) {
      console.error('Error creating contact:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Confirma que desea eliminar este contacto?')) return;
    try {
      await contactosApi.delete(id);
      await fetchData();
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const getClienteName = (clienteId) => {
    const found = clientes.find((c) => c.id === clienteId);
    return found ? found.nombre : '—';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-surface-100 tracking-tight">Directorio de Contactos</h2>
          <p className="text-xs text-surface-400 mt-1">Interlocutores, tomadores de decisión y directores de TI</p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-lg shadow-brand-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Contacto</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-surface-500 absolute left-3 top-1/2 -transurface-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, cargo o email..."
            className="w-full bg-surface-950 border border-surface-800 rounded-xl pl-9 pr-4 py-2 text-xs text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        <select
          value={selectedClienteId}
          onChange={(e) => setSelectedClienteId(e.target.value)}
          className="bg-surface-950 border border-surface-800 rounded-xl px-3 py-2 text-xs text-surface-200 focus:outline-none focus:border-brand-500 transition-colors"
        >
          <option value="">Todas las empresas</option>
          {clientes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner message="Cargando contactos..." />
      ) : (
        <div className="bg-surface-900 border border-surface-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-surface-300">
              <thead className="bg-surface-950/70 text-[11px] uppercase tracking-wider text-surface-400 border-b border-surface-800">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Contacto</th>
                  <th className="py-3.5 px-4 font-semibold">Cargo</th>
                  <th className="py-3.5 px-4 font-semibold">Empresa / Cuenta</th>
                  <th className="py-3.5 px-4 font-semibold">Correo</th>
                  <th className="py-3.5 px-4 font-semibold">Teléfono</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Decision Maker</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-800/60">
                {contactos.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-surface-100 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-surface-800 border border-surface-700 text-brand-400 text-xs font-bold flex items-center justify-center">
                        {c.nombre?.charAt(0)}
                      </div>
                      <span>{c.nombre} {c.apellido || ''}</span>
                    </td>
                    <td className="py-3.5 px-4 text-surface-300">
                      {c.cargo || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-surface-300 font-medium">
                      {getClienteName(c.cliente_id)}
                    </td>
                    <td className="py-3.5 px-4 text-surface-400 font-mono text-[11px]">
                      {c.email || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-surface-400 font-mono text-[11px]">
                      {c.telefono || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {c.es_decision_maker ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Sí</span>
                        </span>
                      ) : (
                        <span className="text-surface-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-surface-400 hover:text-rose-400 hover:bg-surface-800 rounded-lg transition-colors"
                        title="Eliminar contacto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {contactos.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-surface-500 font-medium">
                      No se encontraron contactos registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Registrar Nuevo Contacto"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-surface-300 mb-1">Empresa / Cuenta *</label>
            <select
              required
              value={formData.cliente_id}
              onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
              className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="">Selecciona una empresa...</option>
              {clientes.map((cli) => (
                <option key={cli.id} value={cli.id}>
                  {cli.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-surface-300 mb-1">Nombre *</label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Roberto"
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-surface-300 mb-1">Apellido</label>
              <input
                type="text"
                value={formData.apellido}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                placeholder="Ej: Vargas"
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-surface-300 mb-1">Cargo / Puesto</label>
            <input
              type="text"
              value={formData.cargo}
              onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
              placeholder="Ej: Director de TI / CTO"
              className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-surface-300 mb-1">Correo Electrónico</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="roberto.vargas@empresa.com.mx"
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
            <div>
              <label className="block font-semibold text-surface-300 mb-1">Teléfono</label>
              <input
                type="text"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+52 55 1234 5678"
                className="w-full bg-surface-950 border border-surface-800 rounded-xl px-3.5 py-2.5 text-surface-100 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="es_decision_maker"
              checked={formData.es_decision_maker}
              onChange={(e) => setFormData({ ...formData, es_decision_maker: e.target.checked })}
              className="w-4 h-4 rounded text-brand-600 bg-surface-900 border-surface-700 focus:ring-0"
            />
            <label htmlFor="es_decision_maker" className="text-surface-300 font-semibold cursor-pointer">
              Es tomador de decisión (Decision Maker)
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-surface-400 hover:text-surface-200 hover:bg-surface-800 font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold shadow-lg shadow-brand-600/25 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? 'Guardando...' : 'Crear Contacto'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
