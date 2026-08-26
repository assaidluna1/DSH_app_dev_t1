import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { TrendingUp, Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@techdist.mx');
  const [password, setPassword] = useState('Techdist2025!');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onLoginSuccess?.();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 'Credenciales inválidas. Verifique su correo y contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Techdist2025!');
  };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="bg-surface-900/90 border border-surface-800 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-black/60">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 shadow-xl shadow-brand-500/25 mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-surface-100 tracking-tight">TechDist CRM</h1>
            <p className="text-xs text-surface-400 mt-1 font-medium">Portal Ejecutivo & Administración de Pipeline</p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-surface-300 mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-surface-500 absolute left-3.5 top-1/2 -transurface-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@techdist.mx"
                  className="w-full bg-surface-950/80 border border-surface-800 rounded-xl pl-10 pr-4 py-2.5 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-surface-300 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-surface-500 absolute left-3.5 top-1/2 -transurface-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-surface-950/80 border border-surface-800 rounded-xl pl-10 pr-4 py-2.5 text-surface-100 placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-600 hover:from-brand-500 hover:to-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? 'Autenticando...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick demo credentials selector */}
          <div className="mt-8 pt-6 border-t border-surface-800/80">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-surface-400 text-center mb-3">
              Credenciales Rápidas de Demo
            </div>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@techdist.mx')}
                className="p-2 rounded-xl bg-surface-800/80 hover:bg-surface-800 border border-surface-700/60 text-surface-300 font-medium text-center transition-colors"
              >
                <span className="block font-bold text-brand-400">Admin</span>
                <span className="text-[10px] text-surface-400">Acceso Total</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('juan.garcia@techdist.mx')}
                className="p-2 rounded-xl bg-surface-800/80 hover:bg-surface-800 border border-surface-700/60 text-surface-300 font-medium text-center transition-colors"
              >
                <span className="block font-bold text-emerald-400">Vendedor</span>
                <span className="text-[10px] text-surface-400">Juan García</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('director@techdist.mx')}
                className="p-2 rounded-xl bg-surface-800/80 hover:bg-surface-800 border border-surface-700/60 text-surface-300 font-medium text-center transition-colors"
              >
                <span className="block font-bold text-purple-400">Director</span>
                <span className="text-[10px] text-surface-400">Viewer CEO</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
