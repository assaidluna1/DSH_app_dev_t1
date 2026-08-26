import React, { useState, useEffect } from 'react';
import { oportunidadesApi } from '../../api/oportunidades';
import { productosApi } from '../../api/clientes';
import { StageBadge, PriorityBadge, formatCurrency, stageLabels } from '../Shared/Badge';
import { LoadingSpinner } from '../Shared/LoadingSpinner';
import { 
  Building2, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Plus, 
  MessageSquare, 
  Activity, 
  Package, 
  FileText, 
  Trash2,
  CheckCircle2,
} from 'lucide-react';

export const OportunidadDetail = ({ oportunidadId, onClose, onUpdated }) => {
  const [opp, setOpp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'actividades' | 'notas' | 'productos'
  const [availableProducts, setAvailableProducts] = useState([]);

  // Forms states
  const [newNota, setNewNota] = useState('');
  const [newActividad, setNewActividad] = useState({
    tipo: 'llamada',
    titulo: '',
    descripcion: '',
    duracion_min: 30,
    resultado: '',
  });
  const [newProduct, setNewProduct] = useState({
    producto_id: '',
    cantidad: 1,
  });

  const loadDetail = async () => {
    try {
      setLoading(true);
      const data = await oportunidadesApi.get(oportunidadId);
      setOpp(data);
    } catch (err) {
      console.error('Error loading opportunity detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (oportunidadId) {
      loadDetail();
      // Load products list for the product tab
      productosApi.list().then(setAvailableProducts).catch(console.error);
    }
  }, [oportunidadId]);

  const handleStageChange = async (newStage) => {
    try {
      const updated = await oportunidadesApi.updateEtapa(oportunidadId, newStage);
      setOpp((prev) => ({ ...prev, ...updated }));
      onUpdated?.();
    } catch (err) {
      console.error('Error updating stage:', err);
    }
  };

  const handleAddNota = async (e) => {
    e.preventDefault();
    if (!newNota.trim()) return;
    try {
      await oportunidadesApi.createNota(oportunidadId, newNota);
      setNewNota('');
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      console.error('Error adding note:', err);
    }
  };

  const handleAddActividad = async (e) => {
    e.preventDefault();
    if (!newActividad.titulo.trim()) return;
    try {
      await oportunidadesApi.createActividad(oportunidadId, {
        ...newActividad,
        oportunidad_id: oportunidadId,
        duracion_min: parseInt(newActividad.duracion_min) || 30,
      });
      setNewActividad({
        tipo: 'llamada',
        titulo: '',
        descripcion: '',
        duracion_min: 30,
        resultado: '',
      });
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      console.error('Error adding activity:', err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.producto_id) return;
    try {
      await oportunidadesApi.addProducto(oportunidadId, {
        producto_id: newProduct.producto_id,
        cantidad: parseInt(newProduct.cantidad) || 1,
      });
      setNewProduct({ producto_id: '', cantidad: 1 });
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const handleRemoveProduct = async (opProdId) => {
    try {
      await oportunidadesApi.removeProducto(oportunidadId, opProdId);
      await loadDetail();
      onUpdated?.();
    } catch (err) {
      console.error('Error removing product:', err);
    }
  };

  if (loading || !opp) {
    return <LoadingSpinner message="Cargando detalles de la oportunidad..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-surface-950/60 p-4 rounded-2xl border border-surface-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-surface-400">Cliente:</span>
            <span className="text-sm font-bold text-surface-100">{opp.cliente?.nombre || '—'}</span>
            <span className="text-xs text-brand-400 px-2 py-0.5 rounded bg-brand-500/10 border border-brand-500/20">
              {opp.cliente?.segmento || 'SMB'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs">
            <span className="text-surface-400 font-semibold">Valor Estimado:</span>
            <span className="text-base font-extrabold text-emerald-400">
              {formatCurrency(opp.valor_estimado_usd)}
            </span>
            <span className="text-surface-400">Probabilidad:</span>
            <span className="font-bold text-brand-400">{Math.round(opp.probabilidad)}%</span>
          </div>
        </div>

        {/* Quick Stage Mover */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-surface-400 font-semibold">Etapa:</span>
          <select
            value={opp.etapa}
            onChange={(e) => handleStageChange(e.target.value)}
            className="bg-surface-900 border border-surface-700 text-xs font-medium text-surface-100 rounded-xl px-3 py-1.5 focus:outline-none focus:border-brand-500 transition-colors"
          >
            {Object.entries(stageLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <PriorityBadge prioridad={opp.prioridad} />
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-surface-800 gap-2">
        {[
          { id: 'general', label: 'Información General', icon: FileText },
          { id: 'actividades', label: `Actividades (${opp.actividades?.length || 0})`, icon: Activity },
          { id: 'notas', label: `Notas (${opp.notas?.length || 0})`, icon: MessageSquare },
          { id: 'productos', label: `Productos (${opp.productos?.length || 0})`, icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                  : 'border-transparent text-surface-400 hover:text-surface-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="text-xs">
        {/* 1. GENERAL INFO */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-950/40 p-4 rounded-xl border border-surface-800/80">
              <div>
                <p className="text-surface-400 font-semibold mb-1">Fecha de Cierre Estimada</p>
                <p className="text-surface-200 font-medium">{opp.fecha_cierre_estimada || 'No definida'}</p>
              </div>
              <div>
                <p className="text-surface-400 font-semibold mb-1">Propietario / Vendedor</p>
                <p className="text-surface-200 font-medium">{opp.propietario?.nombre || '—'}</p>
              </div>
              <div>
                <p className="text-surface-400 font-semibold mb-1">Contacto Principal</p>
                <p className="text-surface-200 font-medium">
                  {opp.contacto_principal ? `${opp.contacto_principal.nombre} (${opp.contacto_principal.cargo || 'Contacto'})` : 'Sin asignar'}
                </p>
              </div>
              <div>
                <p className="text-surface-400 font-semibold mb-1">Origen del Lead</p>
                <p className="text-surface-200 font-medium capitalize">{opp.origen || 'No especificado'}</p>
              </div>
              {opp.motivo_perdida && (
                <div className="col-span-2">
                  <p className="text-rose-400 font-semibold mb-1">Motivo de Pérdida</p>
                  <p className="text-rose-200 font-medium">{opp.motivo_perdida}</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-surface-950/40 p-4 rounded-xl border border-surface-800/80">
              <p className="text-surface-400 font-semibold mb-2">Descripción del Proyecto</p>
              <p className="text-surface-200 whitespace-pre-wrap leading-relaxed">
                {opp.descripcion || 'Sin descripción adicional proporcionada.'}
              </p>
            </div>
          </div>
        )}

        {/* 2. ACTIVIDADES */}
        {activeTab === 'actividades' && (
          <div className="space-y-6">
            {/* Add Activity Form */}
            <form onSubmit={handleAddActividad} className="bg-surface-950/50 p-4 rounded-xl border border-surface-800 space-y-3">
              <h4 className="font-bold text-surface-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-400" /> Registrar Nueva Actividad
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-surface-400 mb-1">Tipo</label>
                  <select
                    value={newActividad.tipo}
                    onChange={(e) => setNewActividad({ ...newActividad, tipo: e.target.value })}
                    className="w-full bg-surface-900 border border-surface-800 rounded-lg px-2.5 py-1.5 text-surface-200"
                  >
                    <option value="llamada">Llamada</option>
                    <option value="reunion">Reunión</option>
                    <option value="demo">Demo</option>
                    <option value="propuesta">Propuesta</option>
                    <option value="seguimiento">Seguimiento</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-surface-400 mb-1">Título / Asunto *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Reunión con CIO y equipo de seguridad"
                    value={newActividad.titulo}
                    onChange={(e) => setNewActividad({ ...newActividad, titulo: e.target.value })}
                    className="w-full bg-surface-900 border border-surface-800 rounded-lg px-2.5 py-1.5 text-surface-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-surface-400 mb-1">Resultado / Conclusión</label>
                  <input
                    type="text"
                    placeholder="Ej: Acordaron enviar propuesta económica antes del viernes"
                    value={newActividad.resultado}
                    onChange={(e) => setNewActividad({ ...newActividad, resultado: e.target.value })}
                    className="w-full bg-surface-900 border border-surface-800 rounded-lg px-2.5 py-1.5 text-surface-200"
                  />
                </div>
                <div>
                  <label className="block text-surface-400 mb-1">Duración (minutos)</label>
                  <input
                    type="number"
                    value={newActividad.duracion_min}
                    onChange={(e) => setNewActividad({ ...newActividad, duracion_min: e.target.value })}
                    className="w-full bg-surface-900 border border-surface-800 rounded-lg px-2.5 py-1.5 text-surface-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg shadow transition-all"
              >
                Guardar Actividad
              </button>
            </form>

            {/* Activities Feed */}
            <div className="space-y-3">
              {opp.actividades?.map((act) => (
                <div key={act.id} className="bg-surface-950/40 p-4 rounded-xl border border-surface-800/80 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-900 border border-surface-800 text-brand-400 shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-surface-200 text-sm">{act.titulo}</span>
                      <span className="text-[11px] text-surface-400 font-mono">
                        {act.fecha ? new Date(act.fecha).toLocaleDateString('es-MX', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-surface-400 mt-1">
                      <span className="capitalize px-1.5 py-0.5 rounded bg-surface-800 text-surface-300 font-semibold">{act.tipo}</span>
                      {act.duracion_min && <span>{act.duracion_min} mins</span>}
                      {act.usuario && <span>Por: {act.usuario.nombre}</span>}
                    </div>
                    {act.resultado && (
                      <p className="mt-2 text-surface-300 bg-surface-900/60 p-2 rounded-lg border border-surface-800/50">
                        <span className="font-semibold text-emerald-400">Resultado: </span>
                        {act.resultado}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {(!opp.actividades || opp.actividades.length === 0) && (
                <p className="text-center py-6 text-surface-500">No hay actividades registradas en esta oportunidad.</p>
              )}
            </div>
          </div>
        )}

        {/* 3. NOTAS */}
        {activeTab === 'notas' && (
          <div className="space-y-6">
            <form onSubmit={handleAddNota} className="bg-surface-950/50 p-4 rounded-xl border border-surface-800 space-y-3">
              <h4 className="font-bold text-surface-200 flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-400" /> Añadir Nota Interna
              </h4>
              <textarea
                rows="2"
                required
                value={newNota}
                onChange={(e) => setNewNota(e.target.value)}
                placeholder="Escribe comentarios, acuerdos o recordatorios..."
                className="w-full bg-surface-900 border border-surface-800 rounded-lg p-2.5 text-surface-200 placeholder-surface-500 focus:outline-none focus:border-brand-500 resize-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg shadow transition-all"
              >
                Publicar Nota
              </button>
            </form>

            <div className="space-y-3">
              {opp.notas?.map((nota) => (
                <div key={nota.id} className="bg-surface-950/40 p-4 rounded-xl border border-surface-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-surface-400">
                    <span className="font-semibold text-surface-300">{nota.usuario?.nombre || 'Usuario'}</span>
                    <span className="font-mono">
                      {nota.created_at ? new Date(nota.created_at).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                    </span>
                  </div>
                  <p className="text-surface-200 leading-relaxed whitespace-pre-wrap">{nota.contenido}</p>
                </div>
              ))}
              {(!opp.notas || opp.notas.length === 0) && (
                <p className="text-center py-6 text-surface-500">No hay notas registradas.</p>
              )}
            </div>
          </div>
        )}

        {/* 4. PRODUCTOS */}
        {activeTab === 'productos' && (
          <div className="space-y-6">
            <form onSubmit={handleAddProduct} className="bg-surface-950/50 p-4 rounded-xl border border-surface-800 flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-surface-400 mb-1">Agregar Producto de Catálogo</label>
                <select
                  required
                  value={newProduct.producto_id}
                  onChange={(e) => setNewProduct({ ...newProduct, producto_id: e.target.value })}
                  className="w-full bg-surface-900 border border-surface-800 rounded-lg px-2.5 py-1.5 text-surface-200"
                >
                  <option value="">Selecciona un producto...</option>
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} — {formatCurrency(p.precio_lista_usd)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-24">
                <label className="block text-surface-400 mb-1">Cantidad</label>
                <input
                  type="number"
                  min="1"
                  value={newProduct.cantidad}
                  onChange={(e) => setNewProduct({ ...newProduct, cantidad: e.target.value })}
                  className="w-full bg-surface-900 border border-surface-800 rounded-lg px-2.5 py-1.5 text-surface-200"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-lg shadow transition-all h-[34px]"
              >
                Agregar
              </button>
            </form>

            <div className="border border-surface-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-950/80 text-[11px] uppercase tracking-wider text-surface-400 border-b border-surface-800">
                  <tr>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Fabricante</th>
                    <th className="py-2.5 px-3 text-center">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Precio Unitario</th>
                    <th className="py-2.5 px-3 text-right">Total USD</th>
                    <th className="py-2.5 px-2 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-800/60 bg-surface-950/30">
                  {opp.productos?.map((item) => {
                    const unitPrice = item.precio_unitario_usd || item.producto?.precio_lista_usd || 0;
                    const totalLine = unitPrice * item.cantidad;
                    return (
                      <tr key={item.id} className="hover:bg-surface-900/50">
                        <td className="py-2.5 px-3 font-semibold text-surface-100">
                          {item.producto?.nombre || 'Producto'}
                        </td>
                        <td className="py-2.5 px-3 text-surface-400">
                          {item.producto?.fabricante?.nombre || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-surface-200">
                          {item.cantidad}
                        </td>
                        <td className="py-2.5 px-3 text-right text-surface-300">
                          {formatCurrency(unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                          {formatCurrency(totalLine)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => handleRemoveProduct(item.id)}
                            title="Quitar"
                            className="p-1 text-surface-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {(!opp.productos || opp.productos.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-surface-500">
                        No hay productos asociados a esta oportunidad.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
