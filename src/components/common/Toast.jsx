import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import useToastStore from '../../store/toastStore';

export const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);
  const removeToast = useToastStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:right-5 z-[9999] flex flex-col gap-2 max-w-sm w-[90vw] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-sm font-semibold transition-all duration-300 animate-in slide-in-from-bottom-2 ${
            t.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200 shadow-red-500/10'
              : t.type === 'info'
              ? 'bg-blue-50 text-blue-900 border-blue-200 shadow-blue-500/10'
              : 'bg-emerald-50 text-emerald-900 border-emerald-200 shadow-emerald-500/10'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {t.type === 'error' && <AlertCircle size={18} className="text-red-600 shrink-0" />}
            {t.type === 'info' && <Info size={18} className="text-blue-600 shrink-0" />}
            {t.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />}
            <span>{t.message}</span>
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="p-1 hover:bg-black/5 rounded-lg ml-2 text-surface-400 hover:text-surface-700 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
