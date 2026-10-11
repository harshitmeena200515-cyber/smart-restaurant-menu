import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  restaurant as defaultRestaurant,
  categories as defaultCategories,
  menuItems as defaultItems,
  customizationGroups as defaultGroups,
} from '../data/sampleMenu';
import { getProductImageUrl, getCategoryFallback } from '../utils/imageUtils';

// Resilient storage wrapper that catches localStorage errors and handles quota exhaustion
const safeStorage = {
  getItem: (key) => {
    try {
      const val = localStorage.getItem(key);
      if (val) return val;
      // Seamless migration from previous storage versions
      if (key === 'smart-menu-storage-v5') {
        const v4 = localStorage.getItem('smart-menu-storage-v4');
        if (v4) return v4;
      }
      return null;
    } catch (e) {
      console.warn('[Storage] Failed to read from localStorage:', e);
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('[Storage] Failed to write to localStorage, attempting quota cleanup:', e);
      try {
        // Clean any old or legacy cache keys
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && k !== key && (k.startsWith('smart-menu-storage-v1') || k.startsWith('smart-menu-storage-v2'))) {
            localStorage.removeItem(k);
          }
        }
        localStorage.setItem(key, value);
      } catch (err2) {
        console.error('[Storage] Critical storage quota error:', err2);
      }
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      // ignore
    }
  },
};

export const useMenuStore = create(
  persist(
    (set, get) => ({
      // ─── State ───────────────────────────────────────────────────
      restaurant: { ...defaultRestaurant },
      categories: [...defaultCategories],
      menuItems: defaultItems.map((item) => ({
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

      // ─── Availability (Live One-Tap Stock Status) ────────────────
      toggleAvailability: (itemId) => {
        let newStatus = null;
        set((s) => ({
          menuItems: s.menuItems.map((item) => {
            if (item.id === itemId) {
              newStatus = !item.isAvailable;
              return { ...item, isAvailable: newStatus };
            }
            return item;
          }),
        }));
        return newStatus;
      },

      setAvailability: (itemId, isAvailable) =>
        set((s) => ({
          menuItems: s.menuItems.map((item) =>
            item.id === itemId ? { ...item, isAvailable: Boolean(isAvailable) } : item
          ),
        })),

      bulkSetAvailability: (itemIds, isAvailable) =>
        set((s) => ({
          menuItems: s.menuItems.map((item) =>
            itemIds.includes(item.id) ? { ...item, isAvailable: Boolean(isAvailable) } : item
          ),
        })),

      // ─── Menu Items (Reliable CRUD & Image Lifecycle) ────────────
      addItem: (item) => {
        let createdItem = null;
        set((s) => {
          const safeImage =
            item.image && typeof item.image === 'string' && item.image.trim()
              ? item.image.trim()
              : getCategoryFallback(item.category);

          const hasPortions = Boolean(item.hasPortions);
          const priceHalf = hasPortions && Number(item.priceHalf) >= 0 ? Number(item.priceHalf) : null;
          const priceFull = hasPortions && Number(item.priceFull) >= 0 ? Number(item.priceFull) : (Number(item.price) >= 0 ? Number(item.price) : 0);
          const basePrice = hasPortions ? priceFull : (Number(item.price) >= 0 ? Number(item.price) : 0);

          const newItem = {
            id: item.id || `item-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
            name: (item.name || '').trim(),
            description: (item.description || '').trim(),
            price: basePrice,
            hasPortions,
            priceHalf,
            priceFull,
            category: item.category || 'starters',
            image: safeImage,
            isVeg: item.isVeg !== undefined ? Boolean(item.isVeg) : true,
            isSpicy: Boolean(item.isSpicy),
            spiceLevel: item.isSpicy ? (parseInt(item.spiceLevel, 10) || 1) : 0,
            isFeatured: Boolean(item.isFeatured),
            isAvailable: item.isAvailable !== undefined ? Boolean(item.isAvailable) : true,
            customizationGroupIds: Array.isArray(item.customizationGroupIds)
              ? [...item.customizationGroupIds]
              : [],
          };
          createdItem = newItem;

          return {
            menuItems: [newItem, ...s.menuItems],
          };
        });
        return createdItem;
      },

      updateItem: (itemId, updates) => {
        let updatedItem = null;
        set((s) => ({
          menuItems: s.menuItems.map((item) => {
            if (item.id !== itemId) return item;

            // Handle image updates accurately
            let finalImage = item.image;
            if (updates.image !== undefined && updates.image !== null) {
              if (typeof updates.image === 'string' && updates.image.trim() !== '') {
                finalImage = updates.image.trim();
              } else if (updates.image === '') {
                finalImage = getCategoryFallback(updates.category || item.category);
              }
            }

            const hasPortions =
              updates.hasPortions !== undefined ? Boolean(updates.hasPortions) : Boolean(item.hasPortions);

            const priceHalf = hasPortions
              ? (updates.priceHalf !== undefined && Number(updates.priceHalf) >= 0
                  ? Number(updates.priceHalf)
                  : (item.priceHalf !== undefined && Number(item.priceHalf) >= 0 ? Number(item.priceHalf) : null))
              : null;

            const priceFull = hasPortions
              ? (updates.priceFull !== undefined && Number(updates.priceFull) >= 0
                  ? Number(updates.priceFull)
                  : (item.priceFull !== undefined && Number(item.priceFull) >= 0
                      ? Number(item.priceFull)
                      : (Number(updates.price ?? item.price) >= 0 ? Number(updates.price ?? item.price) : 0)))
              : null;

            const finalPrice = hasPortions
              ? (priceFull ?? (Number(updates.price ?? item.price) >= 0 ? Number(updates.price ?? item.price) : 0))
              : (updates.price !== undefined
                  ? (Number(updates.price) >= 0 ? Number(updates.price) : 0)
                  : item.price);

            const finalName = updates.name !== undefined ? updates.name.trim() : item.name;

            const next = {
              ...item,
              ...updates,
              name: finalName,
              price: finalPrice,
              hasPortions,
              priceHalf,
              priceFull,
              image: finalImage,
              spiceLevel:
                updates.isSpicy !== undefined
                  ? updates.isSpicy
                    ? parseInt(updates.spiceLevel, 10) || 1
                    : 0
                  : item.spiceLevel,
            };
            updatedItem = next;
            return next;
          }),
        }));
        return updatedItem;
      },

      deleteItem: (itemId) => {
        set((s) => ({
          menuItems: s.menuItems.filter((item) => item.id !== itemId),
        }));
        return true;
      },

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
          menuItems: defaultItems.map((item) => ({
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
            {
              ...category,
              id: category.id || category.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              order: s.categories.length + 1,
            },
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

      // ─── Customization Groups (Half/Full, Variants & Add-ons) ───
      addCustomizationGroup: (group) =>
        set((s) => ({
          customizationGroups: [
            ...s.customizationGroups,
            {
              ...group,
              id: group.id || `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: (group.name || '').trim(),
              required: Boolean(group.required),
              minSelect: group.required ? 1 : 0,
              maxSelect: group.maxSelect || 1,
              options: Array.isArray(group.options) ? group.options : [],
            },
          ],
        })),

      updateCustomizationGroup: (groupId, updates) =>
        set((s) => ({
          customizationGroups: s.customizationGroups.map((g) =>
            g.id === groupId
              ? {
                  ...g,
                  ...updates,
                  options: Array.isArray(updates.options) ? [...updates.options] : g.options,
                }
              : g
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
            item.description?.toLowerCase().includes(q)
        );
      },
    }),
    {
      name: 'smart-menu-storage-v5',
      storage: createJSONStorage(() => safeStorage),
      // Safe rehydration: preserve custom uploaded/saved images, portion prices, and restore Mitti Farms
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.restaurant) {
            // Restore Mitti Farms branding
            if (state.restaurant.name === 'Chulha Bistro') {
              state.restaurant.name = defaultRestaurant.name;
              state.restaurant.subname = defaultRestaurant.subname;
              state.restaurant.tagline = defaultRestaurant.tagline;
            } else if (!state.restaurant.name) {
              state.restaurant.name = 'Mitti Farms';
            }
          }
          if (Array.isArray(state.menuItems)) {
            state.menuItems = state.menuItems.map((item) => {
              const defaultMatch = defaultItems.find((d) => d.id === item.id);
              // Ensure items designed with portions always have portion support
              const hasPortions =
                item.hasPortions === true
                  ? true
                  : defaultMatch && defaultMatch.hasPortions
                  ? true
                  : Boolean(item.hasPortions);

              const priceHalf =
                hasPortions
                  ? (item.priceHalf !== undefined && item.priceHalf !== null && Number(item.priceHalf) >= 0
                      ? Number(item.priceHalf)
                      : defaultMatch?.priceHalf ?? Math.round(Number(item.price || 100) * 0.6))
                  : null;

              const priceFull =
                hasPortions
                  ? (item.priceFull !== undefined && item.priceFull !== null && Number(item.priceFull) >= 0
                      ? Number(item.priceFull)
                      : defaultMatch?.priceFull ?? Number(item.price || 100))
                  : null;

              const updatedItem = {
                ...item,
                hasPortions,
                priceHalf,
                priceFull,
                price: hasPortions && priceFull ? priceFull : item.price,
              };

              // Fallback image if missing
              if (!updatedItem.image) {
                updatedItem.image = getProductImageUrl('', updatedItem.category, updatedItem.id, updatedItem.name);
              }
              return updatedItem;
            });
          }
        }
      },
    }
  )
);

export default useMenuStore;
