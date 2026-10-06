// ─── Image Fallbacks & Utilities ───────────────────────────────────────

export const CATEGORY_FALLBACK_IMAGES = {
  breads: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=480&h=320&fit=crop',
  starters: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=480&h=320&fit=crop',
  mains: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=480&h=320&fit=crop',
  biryanis: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=480&h=320&fit=crop',
  chinese: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=480&h=320&fit=crop',
  desserts: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=480&h=320&fit=crop',
  beverages: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=480&h=320&fit=crop',
  default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=480&h=320&fit=crop',
};

// Known broken/dead Unsplash photo IDs that must be auto-healed
export const BROKEN_IMAGE_HEAL_MAP = {
  'photo-1604882355545-b0e80b2308d5': 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=480&h=320&fit=crop', // Tandoori Roti
  'photo-1606491956689-2ea866880049': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=480&h=320&fit=crop', // Hara Bhara Kebab
  'photo-1645696301019-35adcc0d5470': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=480&h=320&fit=crop', // Veg Manchurian
  'photo-1666190050884-0126b86c0910': 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=480&h=320&fit=crop', // Gulab Jamun
  'photo-1571006463534-956ce15dee33': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=480&h=320&fit=crop', // Rasmalai
};

/**
 * Returns a valid, verified image URL for an item, healing dead links and providing category fallbacks
 */
export function getProductImageUrl(image, category) {
  if (!image || typeof image !== 'string' || !image.trim()) {
    return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.default;
  }

  const clean = image.trim();

  // Heal known dead links
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
 * Compresses and reads an uploaded File into an optimized Data URL
 * suitable for localStorage and offline rendering.
 */
export function processUploadedImage(file, maxWidth = 800, maxHeight = 600, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file provided'));

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return reject(new Error('Please select a JPG, PNG, or WEBP image file.'));
    }

    // Validate size (max 10MB raw)
    if (file.size > 10 * 1024 * 1024) {
      return reject(new Error('Image file is too large (maximum 10 MB).'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
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
        if (!ctx) return resolve(e.target.result); // Fallback to raw base64 if canvas unavailable

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
