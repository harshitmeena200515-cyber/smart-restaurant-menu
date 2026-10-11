import { create } from 'zustand';

export const useToastStore = create((set) => ({
  toasts: [],
  showToast: (message, type = 'success', duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  success: (msg) => useToastStore.getState().showToast(msg, 'success'),
  error: (msg) => useToastStore.getState().showToast(msg, 'error', 4500),
  info: (msg) => useToastStore.getState().showToast(msg, 'info'),
};

export default useToastStore;
