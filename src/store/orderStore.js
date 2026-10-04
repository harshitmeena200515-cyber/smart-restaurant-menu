import { create } from 'zustand';

let nextOrderId = 1000;

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null, // after placing

  placeOrder: ({ items, table, cartTotal }) => {
    const order = {
      id: `ORD-${++nextOrderId}`,
      items: items.map((ci) => ({
        name: ci.name,
        quantity: ci.quantity,
        unitPrice: ci.itemTotal,
        customizations: ci.selectedCustomizations || [],
      })),
      table: table || null,
      total: cartTotal,
      status: 'confirmed',
      placedAt: new Date().toISOString(),
    };

    set((s) => ({
      orders: [...s.orders, order],
      currentOrder: order,
    }));

    return order;
  },

  clearCurrentOrder: () => set({ currentOrder: null }),

  getOrders: () => get().orders,
}));

export default useOrderStore;
