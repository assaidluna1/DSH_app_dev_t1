import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', message = 'Cargando datos...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 text-surface-400">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-brand-500 mb-3`} />
      {message && <p className="text-sm font-medium text-surface-400">{message}</p>}
    </div>
  );
};
