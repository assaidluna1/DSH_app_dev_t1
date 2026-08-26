import React from 'react';
import { ChevronLeft, ChevronRight, Building2, Eye, Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '../Shared/Badge';

export const ClienteTable = ({
  clientes = [],
  total = 0,
  page = 1,
  size = 20,
  pages = 1,
  onPageChange,
  onSelectCliente,
  onEditCliente,
  onDeleteCliente,
}) => {
  return (
    <div className="bg-surface-900 border border-surface-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-xs text-surface-300">
          <thead className="bg-surface-950/70 text-[11px] uppercase tracking-wider text-surface-400 border-b border-surface-800">
            <tr>
              <th className="py-3.5 px-4 font-semibold">Empresa / Cuenta</th>
              <th className="py-3.5 px-4 font-semibold">Industria</th>
              <th className="py-3.5 px-4 font-semibold">Segmento</th>
              <th className="py-3.5 px-4 font-semibold">Ciudad</th>
              <th className="py-3.5 px-4 font-semibold text-center">Empleados</th>
              <th className="py-3.5 px-4 font-semibold">Sitio Web</th>
              <th className="py-3.5 px-4 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-800/60">
            {clientes.map((cli) => (
              <tr
                key={cli.id}
                onClick={() => onSelectCliente?.(cli.id)}
                className="hover:bg-surface-800/50 cursor-pointer transition-colors group"
              >
                <td className="py-3.5 px-4 font-semibold text-surface-100 group-hover:text-brand-400 transition-colors flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-surface-800 border border-surface-700 text-brand-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span>{cli.nombre}</span>
                </td>
                <td className="py-3.5 px-4 text-surface-300">
                  {cli.industria || '—'}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                    cli.segmento === 'Enterprise'
                      ? 'bg-purple-900/50 text-purple-300 border-purple-700/60'
                      : cli.segmento === 'Mid-Market'
                        ? 'bg-brand-900/50 text-brand-300 border-brand-700/60'
                        : 'bg-surface-800 text-surface-300 border-surface-700'
                  }`}>
                    {cli.segmento}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-surface-300">
                  {cli.ciudad || '—'}
                </td>
                <td className="py-3.5 px-4 text-center font-mono text-surface-300">
                  {cli.num_empleados?.toLocaleString() || '—'}
                </td>
                <td className="py-3.5 px-4 text-surface-400 truncate max-w-xs">
                  {cli.website ? (
                    <a
                      href={cli.website}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-brand-400 hover:underline"
                    >
                      {cli.website.replace('https://', '')}
                    </a>
                  ) : (
                    '—'
                  )}
                </td>
                <td 
                  className="py-3.5 px-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onSelectCliente?.(cli.id)}
                      title="Ver detalle & Stats"
                      className="p-1.5 text-surface-400 hover:text-brand-400 hover:bg-surface-800 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditCliente?.(cli)}
                      title="Editar"
                      className="p-1.5 text-surface-400 hover:text-amber-400 hover:bg-surface-800 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteCliente?.(cli.id)}
                      title="Eliminar"
                      className="p-1.5 text-surface-400 hover:text-rose-400 hover:bg-surface-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-surface-500 font-medium">
                  No se encontraron clientes registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-surface-950/60 px-6 py-4 border-t border-surface-800 flex items-center justify-between">
        <span className="text-xs text-surface-400">
          Mostrando {clientes.length} de {total} empresas
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-surface-300 px-2">
            Página {page} de {pages || 1}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 rounded-lg bg-surface-800 text-surface-300 hover:bg-surface-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
