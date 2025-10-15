"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastTitle, ToastDescription } from "@boostlly/ui";

interface ToastMessage {
  id: string;
  type: "success" | "destructive" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: Omit<ToastMessage, "id">) => void;
  showError: (title: string, description?: string) => void;
  showSuccess: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showRateLimit: () => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ...message, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    if (message.duration !== 0) {
      setTimeout(() => {
        dismissToast(id);
      }, message.duration || 5000);
    }
  }, []);

  const showError = useCallback(
    (title: string, description?: string) => {
      showToast({ type: "destructive", title, description });
    },
    [showToast],
  );

  const showRateLimit = useCallback(() => {
    showToast({
      type: "warning",
      title: "Too many requests",
      description: "Please wait a moment before trying again.",
      duration: 3000,
    });
  }, [showToast]);

  const showSuccess = useCallback(
    (title: string, description?: string) => {
      showToast({ type: "success", title, description });
    },
    [showToast],
  );

  const showWarning = useCallback(
    (title: string, description?: string) => {
      showToast({ type: "warning", title, description });
    },
    [showToast],
  );

  const showInfo = useCallback(
    (title: string, description?: string) => {
      showToast({ type: "info", title, description });
    },
    [showToast],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        showRateLimit,
        dismissToast,
      }}
    >
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            variant={toast.type}
            onDismiss={() => dismissToast(toast.id)}
            duration={toast.duration}
          >
            <ToastTitle>{toast.title}</ToastTitle>
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
