import { create } from 'zustand';
import {
  restaurant as defaultRestaurant,
  categories as defaultCategories,
  menuItems as defaultItems,
  customizationGroups as defaultGroups,
} from '../data/sampleMenu';

let nextItemId = 100;

const useMenuStore = create((set, get) => ({
  // ─── State ───────────────────────────────────────────────────
  restaurant: { ...defaultRestaurant },
  categories: [...defaultCategories],
  menuItems: [...defaultItems],
  customizationGroups: [...defaultGroups],

  // ─── Restaurant ──────────────────────────────────────────────
  toggleRestaurantOpen: () =>
    set((s) => ({
      restaurant: { ...s.restaurant, isOpen: !s.restaurant.isOpen },
    })),

  updateRestaurant: (updates) =>
    set((s) => ({
      restaurant: { ...s.restaurant, ...updates },
    })),

  // ─── Availability (the core feature) ─────────────────────────
  toggleAvailability: (itemId) =>
    set((s) => ({
      menuItems: s.menuItems.map((item) =>
        item.id === itemId ? { ...item, isAvailable: !item.isAvailable } : item
      ),
    })),

  setAvailability: (itemId, isAvailable) =>
    set((s) => ({
      menuItems: s.menuItems.map((item) =>
        item.id === itemId ? { ...item, isAvailable } : item
      ),
    })),

  bulkSetAvailability: (itemIds, isAvailable) =>
    set((s) => ({
      menuItems: s.menuItems.map((item) =>
        itemIds.includes(item.id) ? { ...item, isAvailable } : item
      ),
    })),

  // ─── Menu Items ──────────────────────────────────────────────
  addItem: (item) =>
    set((s) => ({
      menuItems: [
        ...s.menuItems,
        { ...item, id: `item-${String(++nextItemId).padStart(3, '0')}` },
      ],
    })),

  updateItem: (itemId, updates) =>
    set((s) => ({
      menuItems: s.menuItems.map((item) =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    })),

  deleteItem: (itemId) =>
    set((s) => ({
      menuItems: s.menuItems.filter((item) => item.id !== itemId),
    })),

  toggleFeatured: (itemId) =>
    set((s) => ({
      menuItems: s.menuItems.map((item) =>
        item.id === itemId ? { ...item, isFeatured: !item.isFeatured } : item
      ),
    })),

  // ─── Categories ──────────────────────────────────────────────
  addCategory: (category) =>
    set((s) => ({
      categories: [
        ...s.categories,
        { ...category, id: category.id || category.name.toLowerCase().replace(/\s+/g, '-'), order: s.categories.length + 1 },
      ],
    })),

  updateCategory: (catId, updates) =>
    set((s) => ({
      categories: s.categories.map((c) =>
        c.id === catId ? { ...c, ...updates } : c
      ),
    })),

  deleteCategory: (catId) =>
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== catId),
    })),

  // ─── Customization Groups ───────────────────────────────────
  addCustomizationGroup: (group) =>
    set((s) => ({
      customizationGroups: [
        ...s.customizationGroups,
        { ...group, id: group.id || group.name.toLowerCase().replace(/\s+/g, '-') },
      ],
    })),

  updateCustomizationGroup: (groupId, updates) =>
    set((s) => ({
      customizationGroups: s.customizationGroups.map((g) =>
        g.id === groupId ? { ...g, ...updates } : g
      ),
    })),

  deleteCustomizationGroup: (groupId) =>
    set((s) => ({
      customizationGroups: s.customizationGroups.filter((g) => g.id !== groupId),
    })),

  // ─── Selectors / Helpers ─────────────────────────────────────
  getItemsByCategory: (categoryId) =>
    get().menuItems.filter((item) => item.category === categoryId),

  getFeaturedItems: () => get().menuItems.filter((item) => item.isFeatured),

  getAvailableCount: () => get().menuItems.filter((item) => item.isAvailable).length,

  getSoldOutCount: () => get().menuItems.filter((item) => !item.isAvailable).length,

  getCustomizationGroupsForItem: (itemId) => {
    const item = get().menuItems.find((i) => i.id === itemId);
    if (!item) return [];
    return get().customizationGroups.filter((g) =>
      item.customizationGroupIds.includes(g.id)
    );
  },

  searchItems: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return get().menuItems;
    return get().menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  },
}));

export default useMenuStore;
