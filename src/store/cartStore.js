import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false,

  // ─── Cart Drawer ────────────────────────────────────────────
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  // ─── Cart Actions ───────────────────────────────────────────
  addToCart: ({ menuItem, quantity, selectedCustomizations, itemTotal }) => {
    const cartItem = {
      cartId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      menuItemId: menuItem.id,
      name: menuItem.name,
      image: menuItem.image,
      basePrice: menuItem.price,
      quantity,
      selectedCustomizations, // [{ groupName, optionName, price }]
      itemTotal, // price for 1 unit with customizations
    };
    set((s) => ({ items: [...s.items, cartItem] }));
  },

  removeFromCart: (cartId) =>
    set((s) => ({
      items: s.items.filter((item) => item.cartId !== cartId),
    })),

  updateQuantity: (cartId, quantity) => {
    if (quantity < 1) return get().removeFromCart(cartId);
    set((s) => ({
      items: s.items.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  // ─── Selectors ──────────────────────────────────────────────
  getCartTotal: () =>
    get().items.reduce((sum, item) => sum + item.itemTotal * item.quantity, 0),

  getCartCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));

export default useCartStore;
