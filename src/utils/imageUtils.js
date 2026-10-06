// ─── Bundled Food Images & Image Utilities ──────────────────────────────
import imgHaraBhara from '../assets/images/hara-bhara-kebab.jpg';
import imgTandooriRoti from '../assets/images/tandoori-roti.jpg';
import imgVegManchurian from '../assets/images/veg-manchurian.jpg';
import imgGulabJamun from '../assets/images/gulab-jamun.jpg';
import imgRasmalai from '../assets/images/rasmalai.jpg';
import imgFoodFallback from '../assets/images/food-fallback.jpg';

export const LOCAL_FOOD_IMAGES = {
  'item-005': imgHaraBhara,
  'item-016': imgTandooriRoti,
  'item-019': imgVegManchurian,
  'item-023': imgGulabJamun,
  'item-024': imgRasmalai,
};

export const NAME_MATCH_IMAGES = {
  'hara bhara kebab': imgHaraBhara,
  'tandoori roti': imgTandooriRoti,
  'veg manchurian': imgVegManchurian,
  'gulab jamun': imgGulabJamun,
  'rasmalai': imgRasmalai,
};

export const CATEGORY_FALLBACK_IMAGES = {
  breads: imgTandooriRoti,
  starters: imgHaraBhara,
  mains: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=480&h=320&fit=crop',
  biryanis: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=480&h=320&fit=crop',
  chinese: imgVegManchurian,
  desserts: imgGulabJamun,
  beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=480&h=320&fit=crop',
  default: imgFoodFallback,
};

// Known broken Unsplash photo tokens & old local paths to automatically heal
export const BROKEN_IMAGE_HEAL_MAP = {
  'photo-1604882355545-b0e80b2308d5': imgTandooriRoti,
  'photo-1626074353765': imgTandooriRoti,
  'photo-1606491956689-2ea866880049': imgHaraBhara,
  'photo-1567188040759': imgHaraBhara,
  'photo-1645696301019-35adcc0d5470': imgVegManchurian,
  'photo-1585032226651': imgVegManchurian,
  'photo-1666190050884-0126b86c0910': imgGulabJamun,
  'photo-1541832676-9b763b0239ab': imgGulabJamun,
  'photo-1571006463534-956ce15dee33': imgRasmalai,
  'photo-1589301760014': imgRasmalai,
  '/images/hara-bhara-kebab.jpg': imgHaraBhara,
  '/images/tandoori-roti.jpg': imgTandooriRoti,
  '/images/veg-manchurian.jpg': imgVegManchurian,
  '/images/gulab-jamun.jpg': imgGulabJamun,
  '/images/rasmalai.jpg': imgRasmalai,
};

/**
 * Returns a valid, verified image URL for an item, healing dead links and providing local fallbacks
 */
export function getProductImageUrl(image, category, itemId = '', itemName = '') {
  // If the user uploaded a custom image from gallery (data URL), always respect it!
  if (image && typeof image === 'string' && image.startsWith('data:image')) {
    return image;
  }

  // Check exact ID match for local high-res photos
  if (itemId && LOCAL_FOOD_IMAGES[itemId]) {
    return LOCAL_FOOD_IMAGES[itemId];
  }

  // Check name match
  if (itemName) {
    const norm = itemName.toLowerCase().trim();
    for (const [key, val] of Object.entries(NAME_MATCH_IMAGES)) {
      if (norm.includes(key)) {
        return val;
      }
    }
  }

  if (!image || typeof image !== 'string' || !image.trim()) {
    return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.default;
  }

  const clean = image.trim();

  // Heal known dead links or old path strings
  for (const [brokenToken, replacement] of Object.entries(BROKEN_IMAGE_HEAL_MAP)) {
    if (clean.includes(brokenToken)) {
      return replacement;
    }
  }

  return clean;
}

/**
 * Get category-specific fallback image
 */
export function getCategoryFallback(category) {
  return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.default;
}

/**
 * Compresses and reads an uploaded File from Phone Gallery / Device into an optimized Data URL
 * suitable for localStorage and offline rendering.
 */
export function processUploadedImage(file, maxWidth = 900, maxHeight = 700, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file selected from gallery'));

    // Validate type (accept any image/*)
    if (!file.type || !file.type.startsWith('image/')) {
      return reject(new Error('Please select an image file (JPG, PNG, WEBP) from your gallery.'));
    }

    // Validate size (max 20MB raw gallery file)
    if (file.size > 20 * 1024 * 1024) {
      return reject(new Error('Gallery image is too large (maximum 20 MB).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image from device gallery.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image data.'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-preserving dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(e.target.result);

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp if supported, otherwise jpeg
        try {
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          if (webpDataUrl.startsWith('data:image/webp')) {
            return resolve(webpDataUrl);
          }
        } catch {
          // Ignore and fallback to jpeg
        }

        const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(jpegDataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
