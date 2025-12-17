"use client";

/**
 * Toast notification context and UI layer.
 *
 * Provides an application-wide toast system via React Context, exposing:
 * - `addToast` / `removeToast` for low-level control
 * - convenience helpers (`success`, `error`, `warning`, `info`) for common cases
 *
 * The provider renders a fixed-position toast container and manages lifecycle
 * concerns such as:
 * - unique toast ID generation
 * - auto-dismiss timers (configurable per toast)
 * - manual dismiss with a short exit transition
 *
 * Intended usage is to wrap the app shell (e.g., Next.js `layout.tsx`) with
 * `ToastProvider`, then call `useToast()` from any descendant component.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const TOAST_STYLES: Record<
  ToastType,
  {
    bg: string;
    border: string;
    icon: string;
  }
> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-400",
    icon: "✅",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-400",
    icon: "❌",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    icon: "⚠️",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-400",
    icon: "ℹ️",
  },
};

const DEFAULT_DURATION = 5000;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const newToast: Toast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration ?? DEFAULT_DURATION;
      if (duration > 0) {
        window.setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title?: string) => {
      addToast({ type: "success", message, title });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, title?: string) => {
      addToast({ type: "error", message, title, duration: 7000 });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      addToast({ type: "warning", message, title });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, title?: string) => {
      addToast({ type: "info", message, title });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onRemove: (id: string) => void;
}> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{
  toast: Toast;
  onRemove: (id: string) => void;
}> = ({ toast, onRemove }) => {
  const styles = TOAST_STYLES[toast.type];
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = useCallback(() => {
    setIsExiting(true);
    window.setTimeout(() => onRemove(toast.id), 200);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border-2
        rounded-lg shadow-lg p-4 pr-10
        transform transition-all duration-200
        ${isExiting ? "opacity-0 translate-x-4" : "opacity-100 translate-x-0"}
        animate-in slide-in-from-right
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0">{styles.icon}</span>

        <div className="flex-1">
          {toast.title && (
            <h4 className="font-semibold text-(--color-text) mb-1">
              {toast.title}
            </h4>
          )}

          <p className="text-(--color-text-muted) text-sm">{toast.message}</p>
        </div>
      </div>

      <button
        onClick={handleRemove}
        className="absolute top-2 right-2 text-(--color-text-muted) hover:text-(--color-text) transition p-1"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

export default ToastProvider;