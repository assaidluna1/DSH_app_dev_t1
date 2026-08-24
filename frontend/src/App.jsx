import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/Layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Pipeline } from './pages/Pipeline';
import { Oportunidades } from './pages/Oportunidades';
import { Clientes } from './pages/Clientes';
import { Contactos } from './pages/Contactos';
import { Actividades } from './pages/Actividades';
import { LoadingSpinner } from './components/Shared/LoadingSpinner';

const pageTitles = {
  '/': 'Dashboard Ejecutivo',
  '/pipeline': 'Embudo de Ventas (Kanban)',
  '/oportunidades': 'Oportunidades Comerciales',
  '/clientes': 'Directorio de Clientes',
  '/contactos': 'Directorio de Contactos',
  '/actividades': 'Bitácora de Actividades',
};

const MainContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <LoadingSpinner message="Iniciando sesión segura..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => navigate('/')} />;
  }

  const renderPage = () => {
    switch (currentPath) {
      case '/pipeline':
        return <Pipeline />;
      case '/oportunidades':
        return <Oportunidades />;
      case '/clientes':
        return <Clientes />;
      case '/contactos':
        return <Contactos />;
      case '/actividades':
        return <Actividades />;
      case '/':
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      currentPath={currentPath}
      onNavigate={navigate}
      title={pageTitles[currentPath] || 'TechDist CRM'}
    >
      {renderPage()}
    </Layout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
