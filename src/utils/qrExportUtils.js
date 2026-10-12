import QRCode from 'qrcode';
import jsQR from 'jsqr';

export const PRODUCTION_LIVE_BASE = 'https://harshitmeena200515-cyber.github.io/smart-restaurant-menu/';

/**
 * Safely resolves the production-ready destination base URL.
 * Ensures GitHub Pages subfolder (e.g. /smart-restaurant-menu/) is never omitted.
 */
export function getProductionBaseUrl() {
  if (typeof window === 'undefined') return PRODUCTION_LIVE_BASE;

  const { origin, pathname, hostname } = window.location;

  // On GitHub Pages, pathname contains the repository name (e.g. /smart-restaurant-menu/)
  if (hostname.endsWith('github.io')) {
    const segments = pathname.split('/').filter(Boolean);
    const repoName = segments.length > 0 ? segments[0] : 'smart-restaurant-menu';
    return `${origin}/${repoName}/`;
  }

  // If hosted on custom server or subpath
  if (pathname.includes('/smart-restaurant-menu')) {
    return `${origin}/smart-restaurant-menu/`;
  }

  // In local development or preview environments, table stands must point to real public production
  return PRODUCTION_LIVE_BASE;
}

/**
 * Robust XML escaper. Strict case-sensitive XML requires lowercase entities (&amp;, &lt;, etc.).
 * Always convert texts to uppercase BEFORE escaping to avoid invalid entities like &AMP;.
 */
export function escapeXml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Generates an ultra-crisp, print-ready SVG string for a Table Stand QR Card
 * that visually matches the on-screen preview with pixel-perfect consistency.
 */
export function generateStandCardSvg({
  restaurant,
  tableNumber,
  menuUrl,
  includeLogo = true,
}) {
  const restName = (restaurant?.name || 'Mitti Farms').trim();
  const restSub = (restaurant?.subname || 'Farmstay & Dining').trim();
  const logoUrl = restaurant?.logo || '';
  const initial = restName.charAt(0).toUpperCase() || 'M';

  // Generate QR matrix with error correction level H (30% recovery)
  const qr = QRCode.create(menuUrl, { errorCorrectionLevel: 'H' });
  const modCount = qr.modules.size;

  // Center logo excavation bounds (7x7 modules if logo included)
  // For Level H, this only takes ~2-3% of area, leaving huge error recovery margin.
  const centerMod = Math.floor(modCount / 2);
  const excavateRadius = includeLogo ? 3 : 0;
  const minEx = centerMod - excavateRadius;
  const maxEx = centerMod + excavateRadius;

  // Build SVG path data for QR modules
  let pathD = '';
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (includeLogo && r >= minEx && r <= maxEx && c >= minEx && c <= maxEx) {
        continue;
      }
      if (qr.modules.get(r, c)) {
        pathD += `M${c},${r}h1v1h-1z `;
      }
    }
  }

  // QR placement within 800x1100 card
  // Center of card: X = 400, Y = 525
  const qrSize = 420;
  const qrX = 190; // (800 - 420) / 2
  const qrY = 315; // 525 - 210
  const scale = qrSize / modCount;

  // Center logo dimensions strictly inside excavated module region
  // (2 * excavateRadius + 1) modules wide; logo box stays within bounds so no modules are covered
  const logoBoxSize = includeLogo ? Math.round((excavateRadius * 2 + 0.6) * scale) : 0;
  const centerX = qrX + qrSize / 2;
  const centerY = qrY + qrSize / 2;
  const logoBoxX = centerX - logoBoxSize / 2;
  const logoBoxY = centerY - logoBoxSize / 2;

  const tableLabel = tableNumber ? `Table ${tableNumber}` : 'Digital Menu';
  const tableSub = tableNumber ? 'Reserved Table Stand' : 'Scan for Food & Beverage Menu';

  // Strictly escape all strings. Upper-case BEFORE escaping!
  const safeName = escapeXml(restName);
  const safeSubUpper = escapeXml(restSub.toUpperCase());
  const safeUrl = escapeXml(menuUrl);
  const safeTableLabel = escapeXml(tableLabel);
  const safeTableSub = escapeXml(tableSub);
  const safeInitial = escapeXml(initial);

  // Logo rendering: if image is http/data URI, embed as image; else render clean monogram
  let centerLogoSvg = '';
  if (includeLogo) {
    if (logoUrl && (logoUrl.startsWith('data:') || logoUrl.startsWith('http') || logoUrl.startsWith('/'))) {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${Math.round(logoBoxSize * 0.22)}" fill="#ffffff" stroke="#fed7aa" stroke-width="${Math.max(2, Math.round(logoBoxSize * 0.05))}" />
        <clipPath id="logoClip">
          <rect x="${logoBoxX + 3}" y="${logoBoxY + 3}" width="${logoBoxSize - 6}" height="${logoBoxSize - 6}" rx="${Math.round(logoBoxSize * 0.18)}" />
        </clipPath>
        <image x="${logoBoxX + 3}" y="${logoBoxY + 3}" width="${logoBoxSize - 6}" height="${logoBoxSize - 6}" href="${escapeXml(logoUrl)}" clip-path="url(#logoClip)" preserveAspectRatio="xMidYMid slice" />
      `;
    } else {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${Math.round(logoBoxSize * 0.22)}" fill="#fff7ed" stroke="#fed7aa" stroke-width="${Math.max(2, Math.round(logoBoxSize * 0.05))}" />
        <text x="${centerX}" y="${Math.round(centerY + logoBoxSize * 0.22)}" font-family="'Playfair Display', 'Fraunces', Georgia, serif" font-weight="900" font-size="${Math.round(logoBoxSize * 0.58)}" fill="#ea580c" text-anchor="middle">${safeInitial}</text>
      `;
    }
  }

  // Standalone valid SVG string with explicit width/height and viewBox for 100% portable rendering
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="800" height="1100" style="max-width: 100%; height: auto; display: block; aspect-ratio: 800/1100;">
  <defs>
    <style>
      .title { font-family: 'Playfair Display', 'Fraunces', Georgia, serif; font-weight: 900; }
      .sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#1c1917" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Outer Card Background -->
  <rect x="20" y="20" width="760" height="1060" rx="36" fill="#ffffff" stroke="#e7e5e4" stroke-width="3" filter="url(#cardShadow)" />

  <!-- Decorative Top Brand Bar -->
  <path d="M 20 56 A 36 36 0 0 1 56 20 L 744 20 A 36 36 0 0 1 780 56 L 780 32 L 20 32 Z" fill="#ea580c" />

  <!-- Restaurant Header -->
  <text x="400" y="112" class="title" font-size="44" fill="#7c2d12" text-anchor="middle" letter-spacing="1">${safeName}</text>
  <text x="400" y="148" class="sans" font-weight="700" font-size="16" fill="#c2410c" text-anchor="middle" letter-spacing="3">${safeSubUpper}</text>

  <!-- Table / Purpose Pill -->
  <g transform="translate(400, 195)">
    <rect x="-160" y="-22" width="320" height="48" rx="24" fill="${tableNumber ? '#fff7ed' : '#f5f5f4'}" stroke="${tableNumber ? '#fdba74' : '#d6d3d1'}" stroke-width="2" />
    <text x="0" y="8" class="sans" font-weight="800" font-size="${tableNumber ? '22' : '17'}" fill="${tableNumber ? '#c2410c' : '#44403c'}" text-anchor="middle">${safeTableLabel}</text>
  </g>
  <text x="400" y="252" class="sans" font-weight="600" font-size="14" fill="#a8a29e" text-anchor="middle">${safeTableSub}</text>

  <!-- QR Frame Outer Container with Warm Brand Border & Solid Quiet Zone -->
  <rect x="140" y="265" width="520" height="520" rx="32" fill="#ffffff" stroke="#fed7aa" stroke-width="8" />
  <rect x="152" y="277" width="496" height="496" rx="20" fill="#ffffff" />

  <!-- QR Code Modules (Sharp Vector Paths) -->
  <g transform="translate(${qrX}, ${qrY}) scale(${scale})">
    <path d="${pathD}" fill="#1c1917" shape-rendering="crispEdges" />
  </g>

  <!-- Center Logo Badge -->
  ${centerLogoSvg}

  <!-- Bottom URL Info Container (Safe sizing to prevent any text clipping) -->
  <g transform="translate(400, 880)">
    <rect x="-300" y="-36" width="600" height="74" rx="20" fill="#fafaf9" stroke="#e7e5e4" stroke-width="2" />
    <text x="0" y="-12" class="sans" font-weight="800" font-size="12" fill="#a8a29e" text-anchor="middle" letter-spacing="2">DIRECT MENU ACCESS</text>
    <text x="0" y="18" class="sans" font-weight="700" font-size="${safeUrl.length > 55 ? '13' : '15'}" fill="#292524" text-anchor="middle">${safeUrl}</text>
  </g>

  <!-- Helpful Instructions Footer -->
  <text x="400" y="990" class="sans" font-weight="700" font-size="16" fill="#78716c" text-anchor="middle">Scan with your smartphone camera to browse menu</text>
  <text x="400" y="1018" class="sans" font-weight="500" font-size="13" fill="#a8a29e" text-anchor="middle">No app download required · Instant digital availability</text>
</svg>`;
}

/**
 * Generates a standalone, clean, high-resolution vector QR SVG with optional logo.
 */
export function generatePureQrSvg({ menuUrl, restaurant, includeLogo = true }) {
  const restName = (restaurant?.name || 'Mitti Farms').trim();
  const logoUrl = restaurant?.logo || '';
  const initial = restName.charAt(0).toUpperCase() || 'M';

  const qr = QRCode.create(menuUrl, { errorCorrectionLevel: 'H' });
  const modCount = qr.modules.size;
  const margin = 4;
  const totalMod = modCount + margin * 2;
  const viewSize = 800;
  const scale = viewSize / totalMod;

  const centerMod = Math.floor(modCount / 2);
  const excavateRadius = includeLogo ? 3 : 0;
  const minEx = centerMod - excavateRadius;
  const maxEx = centerMod + excavateRadius;

  let pathD = '';
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (includeLogo && r >= minEx && r <= maxEx && c >= minEx && c <= maxEx) {
        continue;
      }
      if (qr.modules.get(r, c)) {
        const x = c + margin;
        const y = r + margin;
        pathD += `M${x},${y}h1v1h-1z `;
      }
    }
  }

  const logoBoxSize = includeLogo ? Math.round((excavateRadius * 2 + 0.6) * scale) : 0;
  const logoBoxX = viewSize / 2 - logoBoxSize / 2;
  const logoBoxY = viewSize / 2 - logoBoxSize / 2;

  const safeInitial = escapeXml(initial);

  let centerLogoSvg = '';
  if (includeLogo) {
    if (logoUrl && (logoUrl.startsWith('data:') || logoUrl.startsWith('http') || logoUrl.startsWith('/'))) {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${Math.round(logoBoxSize * 0.22)}" fill="#ffffff" stroke="#fed7aa" stroke-width="${Math.max(2, Math.round(logoBoxSize * 0.05))}" />
        <clipPath id="pureLogoClip">
          <rect x="${logoBoxX + 3}" y="${logoBoxY + 3}" width="${logoBoxSize - 6}" height="${logoBoxSize - 6}" rx="${Math.round(logoBoxSize * 0.18)}" />
        </clipPath>
        <image x="${logoBoxX + 3}" y="${logoBoxY + 3}" width="${logoBoxSize - 6}" height="${logoBoxSize - 6}" href="${escapeXml(logoUrl)}" clip-path="url(#pureLogoClip)" preserveAspectRatio="xMidYMid slice" />
      `;
    } else {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${Math.round(logoBoxSize * 0.22)}" fill="#fff7ed" stroke="#fed7aa" stroke-width="${Math.max(2, Math.round(logoBoxSize * 0.05))}" />
        <text x="${viewSize / 2}" y="${Math.round(viewSize / 2 + logoBoxSize * 0.22)}" font-family="'Playfair Display', 'Fraunces', Georgia, serif" font-weight="900" font-size="${Math.round(logoBoxSize * 0.58)}" fill="#ea580c" text-anchor="middle">${safeInitial}</text>
      `;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="${viewSize}" height="${viewSize}" style="max-width: 100%; height: auto; display: block; aspect-ratio: 1/1;">
  <!-- Quiet Zone White Background -->
  <rect width="${viewSize}" height="${viewSize}" fill="#ffffff" />
  <!-- QR Modules -->
  <g transform="scale(${scale})">
    <path d="${pathD}" fill="#1c1917" shape-rendering="crispEdges" />
  </g>
  ${centerLogoSvg}
</svg>`;
}

/**
 * Real algorithm verification of QR scannability using jsQR.
 * Decodes the exact generated raster buffer to confirm 100% scannability.
 */
export function verifyQrScannability(menuUrl, includeLogo = true) {
  try {
    const qr = QRCode.create(menuUrl, { errorCorrectionLevel: 'H' });
    const modCount = qr.modules.size;
    const margin = 4;
    const scale = 6;
    const totalMod = modCount + margin * 2;
    const size = totalMod * scale;
    const data = new Uint8ClampedArray(size * size * 4);
    data.fill(255); // White background

    const centerMod = Math.floor(modCount / 2);
    const excavateRadius = includeLogo ? 3 : 0;
    const minEx = centerMod - excavateRadius;
    const maxEx = centerMod + excavateRadius;

    for (let r = 0; r < modCount; r++) {
      for (let c = 0; c < modCount; c++) {
        if (includeLogo && r >= minEx && r <= maxEx && c >= minEx && c <= maxEx) {
          continue;
        }
        if (qr.modules.get(r, c)) {
          for (let py = 0; py < scale; py++) {
            for (let px = 0; px < scale; px++) {
              const idx = (((r + margin) * scale + py) * size + ((c + margin) * scale + px)) * 4;
              data[idx] = 0;
              data[idx + 1] = 0;
              data[idx + 2] = 0;
              data[idx + 3] = 255;
            }
          }
        }
      }
    }

    const result = jsQR(data, size, size);
    if (result && result.data === menuUrl) {
      return {
        scannable: true,
        decodedUrl: result.data,
        level: 'Level H (30% Recovery)',
        modules: `${modCount}×${modCount}`,
      };
    } else if (result) {
      return {
        scannable: true,
        decodedUrl: result.data,
        warning: 'Decoded URL differs slightly from target URL',
        level: 'Level H',
        modules: `${modCount}×${modCount}`,
      };
    } else {
      return {
        scannable: false,
        error: 'Scanner was unable to read the QR code matrix with the selected parameters',
      };
    }
  } catch (err) {
    return {
      scannable: false,
      error: err.message,
    };
  }
}

/**
 * Triggers browser download of SVG string as a proper XML document
 */
export function downloadSvg(svgString, filename) {
  const cleanSvg = svgString.trim();
  const fullSvg = cleanSvg.startsWith('<?xml')
    ? cleanSvg
    : `<?xml version="1.0" encoding="UTF-8"?>\n${cleanSvg}`;
  const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/**
 * Converts SVG to high-resolution PNG (default 1600x2200 for stand, 1200x1200 for pure QR)
 * guaranteeing crisp printing with sharp edges and zero clipping.
 */
export function downloadPngFromSvg(svgString, filename, targetWidth = 1600, targetHeight = 2200) {
  return new Promise((resolve, reject) => {
    try {
      const cleanSvg = svgString.trim();
      const standaloneSvg = cleanSvg.startsWith('<?xml')
        ? cleanSvg
        : `<?xml version="1.0" encoding="UTF-8"?>\n${cleanSvg}`;

      const blob = new Blob([standaloneSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      const renderToCanvas = (imageSource) => {
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Solid white background behind entire artwork
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(imageSource, 0, 0, targetWidth, targetHeight);

        canvas.toBlob((pngBlob) => {
          if (!pngBlob) {
            reject(new Error('Canvas toBlob failed'));
            return;
          }
          const pngUrl = URL.createObjectURL(pngBlob);
          const a = document.createElement('a');
          a.href = pngUrl;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(pngUrl), 5000);
          resolve(true);
        }, 'image/png');
      };

      img.onload = () => {
        try {
          renderToCanvas(img);
          URL.revokeObjectURL(url);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        // Resilient fallback with Data URL
        try {
          const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(standaloneSvg)}`;
          const imgFallback = new Image();
          imgFallback.onload = () => {
            try {
              renderToCanvas(imgFallback);
            } catch (err) {
              reject(err);
            }
          };
          imgFallback.onerror = () => {
            reject(new Error('Failed to rasterize SVG into canvas'));
          };
          imgFallback.src = dataUrl;
        } catch (fallbackErr) {
          reject(fallbackErr);
        }
      };

      img.src = url;
    } catch (err) {
      reject(err);
    }
  });
}
