import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  restaurant as defaultRestaurant,
  categories as defaultCategories,
  menuItems as defaultItems,
  customizationGroups as defaultGroups,
} from '../data/sampleMenu';
import { getProductImageUrl, getCategoryFallback } from '../utils/imageUtils';

let nextItemId = 100;

export const useMenuStore = create(
  persist(
    (set, get) => ({
      // ─── State ───────────────────────────────────────────────────
      restaurant: { ...defaultRestaurant },
      categories: [...defaultCategories],
      menuItems: defaultItems.map(item => ({
        ...item,
        image: getProductImageUrl(item.image, item.category, item.id, item.name),
      })),
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

      // ─── Availability ────────────────────────────────────────────
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

      // ─── Menu Items (Safe Image Lifecycle) ───────────────────────
      addItem: (item) =>
        set((s) => {
          const safeImage = (item.image && typeof item.image === 'string' && item.image.trim())
            ? item.image.trim()
            : getCategoryFallback(item.category);

          const newItem = {
            ...item,
            id: `item-${Date.now()}-${String(++nextItemId).slice(-3)}`,
            image: safeImage,
          };

          return {
            menuItems: [...s.menuItems, newItem],
          };
        }),

      updateItem: (itemId, updates) =>
        set((s) => ({
          menuItems: s.menuItems.map((item) => {
            if (item.id !== itemId) return item;

            // CRITICAL: Safe image update logic!
            // If updates has an explicit valid new image (data URL or http URL), update it.
            // If updates.image is undefined, null, or empty string, PRESERVE existing item.image!
            let finalImage = item.image;
            if (
              updates.image !== undefined &&
              updates.image !== null &&
              typeof updates.image === 'string' &&
              updates.image.trim() !== ''
            ) {
              finalImage = updates.image.trim();
            }

            return {
              ...item,
              ...updates,
              image: finalImage,
            };
          }),
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

      resetToDefaultMenu: () =>
        set({
          restaurant: { ...defaultRestaurant },
          categories: [...defaultCategories],
          menuItems: defaultItems.map(item => ({
            ...item,
            image: getProductImageUrl(item.image, item.category, item.id, item.name),
          })),
          customizationGroups: [...defaultGroups],
        }),

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
          item.customizationGroupIds?.includes(g.id)
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
    }),
    {
      name: 'smart-menu-storage-v3',
      // Migration: automatically heal any old broken Unsplash URLs in localStorage
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.menuItems)) {
          state.menuItems = state.menuItems.map((item) => ({
            ...item,
            image: getProductImageUrl(item.image, item.category, item.id, item.name),
          }));
        }
      },
    }
  )
);

export default useMenuStore;
