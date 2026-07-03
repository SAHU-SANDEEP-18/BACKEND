import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { THEMES } from '../config/themes';

const ToastContext = createContext(null);

const TYPE_CONFIG = {
  success: {
    label: 'Success',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12l3 3 5-5"/>
      </svg>
    ),
  },
  error: {
    label: 'Error',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M15 9l-6 6M9 9l6 6"/>
      </svg>
    ),
  },
  warning: {
    label: 'Warning',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  info: {
    label: 'Info',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
};

function ToastItem({ id, type, message, t, onClose }) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  return (
    <div style={{
      width: '100%',
      background: t.primary,
      borderRadius: '8px',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: `0 4px 20px ${t.primary}55`,
      animation: 'toast-slide-in 0.3s ease',
      position: 'relative',
    }}>
      {/* SVG Icon */}
      <div style={{
        width: '28px',
        height: '28px',
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: t.textOn,
      }}>
        {config.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '700',
          color: t.textOn,
          opacity: 0.7,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}>
          {config.label}
        </div>
        <div style={{
          fontSize: '13px',
          fontWeight: '500',
          color: t.textOn,
          marginTop: '1px',
        }}>
          {message}
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={() => onClose(id)}
        style={{
          background: 'rgba(0,0,0,0.15)',
          border: 'none',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: t.textOn,
          flexShrink: 0,
        }}
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}

export function AppToastContainer({ children }) {
  const themeKey = useSelector((state) => state.theme?.theme || 'teal');
  const t = THEMES[themeKey] || THEMES.teal;
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [{ id, type, message }, ...prev]);
    window.setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const toast = useMemo(() => ({
    success: (msg) => pushToast('success', msg),
    error:   (msg) => pushToast('error',   msg),
    warning: (msg) => pushToast('warning', msg),
    info:    (msg) => pushToast('info',    msg),
  }), [pushToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed',
        top: '16px',
        right: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        zIndex: 9999,
        width: 'clamp(280px, 90vw, 360px)',
      }}>
        {toasts.map((item) => (
          <ToastItem key={item.id} {...item} t={t} onClose={removeToast} />
        ))}
      </div>
      <style>{`
        @keyframes toast-slide-in {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside AppToastContainer');
  return context;
}