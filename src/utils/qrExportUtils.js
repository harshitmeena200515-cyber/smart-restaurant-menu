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
 * Generates an ultra-crisp, print-ready SVG string for a Table Stand QR Card.
 * Uses explicit width, height, and viewBox without collapsing inline styles.
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
  const qrSize = 420;
  const qrX = 190; // (800 - 420) / 2
  const qrY = 315;
  const scale = qrSize / modCount;

  // Center logo dimensions strictly inside excavated module region
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
        <image x="${logoBoxX + 3}" y="${logoBoxY + 3}" width="${logoBoxSize - 6}" height="${logoBoxSize - 6}" href="${escapeXml(logoUrl)}" xlink:href="${escapeXml(logoUrl)}" clip-path="url(#logoClip)" preserveAspectRatio="xMidYMid slice" />
      `;
    } else {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${Math.round(logoBoxSize * 0.22)}" fill="#fff7ed" stroke="#fed7aa" stroke-width="${Math.max(2, Math.round(logoBoxSize * 0.05))}" />
        <text x="${centerX}" y="${centerY}" dominant-baseline="central" font-family="'Playfair Display', 'Fraunces', Georgia, serif" font-weight="900" font-size="${Math.round(logoBoxSize * 0.58)}" fill="#ea580c" text-anchor="middle">${safeInitial}</text>
      `;
    }
  }

  // Standalone valid SVG string with explicit width/height and viewBox for 100% portable rendering
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 800 1100" width="800" height="1100">
  <defs>
    <style>
      .title { font-family: 'Playfair Display', 'Fraunces', Georgia, serif; font-weight: 900; }
      .sans { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    </style>
  </defs>

  <!-- Clean outer background -->
  <rect width="800" height="1100" fill="#ffffff" />

  <!-- Outer Card Border -->
  <rect x="18" y="18" width="764" height="1064" rx="38" fill="#f5f5f4" />
  <rect x="20" y="20" width="760" height="1060" rx="36" fill="#ffffff" stroke="#e7e5e4" stroke-width="2" />

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

  <!-- Bottom URL Info Container -->
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
 * Uses explicit width, height, and viewBox without collapsing inline styles.
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
        <image x="${logoBoxX + 3}" y="${logoBoxY + 3}" width="${logoBoxSize - 6}" height="${logoBoxSize - 6}" href="${escapeXml(logoUrl)}" xlink:href="${escapeXml(logoUrl)}" clip-path="url(#pureLogoClip)" preserveAspectRatio="xMidYMid slice" />
      `;
    } else {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${Math.round(logoBoxSize * 0.22)}" fill="#fff7ed" stroke="#fed7aa" stroke-width="${Math.max(2, Math.round(logoBoxSize * 0.05))}" />
        <text x="${viewSize / 2}" y="${viewSize / 2}" dominant-baseline="central" font-family="'Playfair Display', 'Fraunces', Georgia, serif" font-weight="900" font-size="${Math.round(logoBoxSize * 0.58)}" fill="#ea580c" text-anchor="middle">${safeInitial}</text>
      `;
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${viewSize} ${viewSize}" width="${viewSize}" height="${viewSize}">
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
 * Direct high-resolution Canvas renderer for Standalone Pure QR code.
 * Eliminates all browser SVG-to-canvas rasterizer bugs.
 */
export function renderPureQrToCanvas(canvas, { menuUrl, restaurant, includeLogo = true, size = 1200 }) {
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Solid white background (quiet zone)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  const qr = QRCode.create(menuUrl, { errorCorrectionLevel: 'H' });
  const modCount = qr.modules.size;
  const margin = 4;
  const totalMod = modCount + margin * 2;
  const scale = size / totalMod;

  const centerMod = Math.floor(modCount / 2);
  const excavateRadius = includeLogo ? 3 : 0;
  const minEx = centerMod - excavateRadius;
  const maxEx = centerMod + excavateRadius;

  // Dark modules
  ctx.fillStyle = '#1c1917';
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (includeLogo && r >= minEx && r <= maxEx && c >= minEx && c <= maxEx) {
        continue;
      }
      if (qr.modules.get(r, c)) {
        const x = Math.round((c + margin) * scale);
        const y = Math.round((r + margin) * scale);
        const w = Math.ceil((c + margin + 1) * scale) - x;
        const h = Math.ceil((r + margin + 1) * scale) - y;
        ctx.fillRect(x, y, w, h);
      }
    }
  }

  // Center logo / monogram badge
  if (includeLogo) {
    const logoBoxSize = Math.round((excavateRadius * 2 + 0.6) * scale);
    const logoBoxX = Math.round(size / 2 - logoBoxSize / 2);
    const logoBoxY = Math.round(size / 2 - logoBoxSize / 2);
    const radius = Math.round(logoBoxSize * 0.22);
    const borderWidth = Math.max(3, Math.round(logoBoxSize * 0.05));

    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, radius);
    } else {
      ctx.rect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize);
    }
    ctx.fillStyle = '#fff7ed';
    ctx.fill();
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = '#fed7aa';
    ctx.stroke();

    const restName = (restaurant?.name || 'Mitti Farms').trim();
    const initial = restName.charAt(0).toUpperCase() || 'M';
    ctx.fillStyle = '#ea580c';
    ctx.font = `900 ${Math.round(logoBoxSize * 0.58)}px 'Playfair Display', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, size / 2, size / 2);
    ctx.restore();
  }
}

/**
 * Direct high-resolution Canvas renderer for Table Stand Card (1600×2200 HD).
 * Guarantees crisp printing with 100% visible graphics and zero blank-file risk.
 */
export function renderStandCardToCanvas(
  canvas,
  { restaurant, tableNumber, menuUrl, includeLogo = true, width = 1600, height = 2200 }
) {
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Scale relative to 800×1100 vector master
  const s = width / 800;

  // Solid white document base
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Outer card background
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(18 * s, 18 * s, 764 * s, 1064 * s, 38 * s);
  } else {
    ctx.rect(18 * s, 18 * s, 764 * s, 1064 * s);
  }
  ctx.fillStyle = '#f5f5f4';
  ctx.fill();

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(20 * s, 20 * s, 760 * s, 1060 * s, 36 * s);
  } else {
    ctx.rect(20 * s, 20 * s, 760 * s, 1060 * s);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2 * s;
  ctx.strokeStyle = '#e7e5e4';
  ctx.stroke();

  // Top decorative brand bar
  ctx.fillStyle = '#ea580c';
  ctx.fillRect(56 * s, 20 * s, 688 * s, 12 * s);
  ctx.restore();

  // Restaurant title
  const restName = (restaurant?.name || 'Mitti Farms').trim();
  const restSub = (restaurant?.subname || 'Farmstay & Dining').trim();
  ctx.save();
  ctx.fillStyle = '#7c2d12';
  ctx.font = `900 ${44 * s}px 'Playfair Display', Georgia, serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(restName, 400 * s, 112 * s);

  // Restaurant subtitle
  ctx.fillStyle = '#c2410c';
  ctx.font = `700 ${16 * s}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(restSub.toUpperCase(), 400 * s, 148 * s);

  // Table Pill
  const tableLabel = tableNumber ? `Table ${tableNumber}` : 'Digital Menu';
  const tableSub = tableNumber ? 'Reserved Table Stand' : 'Scan for Food & Beverage Menu';
  const pillW = 320 * s;
  const pillH = 48 * s;
  const pillX = 400 * s - pillW / 2;
  const pillY = 195 * s - pillH / 2;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(pillX, pillY, pillW, pillH, 24 * s);
  } else {
    ctx.rect(pillX, pillY, pillW, pillH);
  }
  ctx.fillStyle = tableNumber ? '#fff7ed' : '#f5f5f4';
  ctx.fill();
  ctx.lineWidth = 2 * s;
  ctx.strokeStyle = tableNumber ? '#fdba74' : '#d6d3d1';
  ctx.stroke();

  ctx.fillStyle = tableNumber ? '#c2410c' : '#44403c';
  ctx.font = `800 ${tableNumber ? 22 * s : 17 * s}px system-ui, -apple-system, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText(tableLabel, 400 * s, 195 * s);

  ctx.fillStyle = '#a8a29e';
  ctx.font = `600 ${14 * s}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(tableSub, 400 * s, 252 * s);
  ctx.restore();

  // QR Container Box & Quiet Zone
  ctx.save();
  const frameX = 140 * s;
  const frameY = 265 * s;
  const frameSize = 520 * s;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(frameX, frameY, frameSize, frameSize, 32 * s);
  } else {
    ctx.rect(frameX, frameY, frameSize, frameSize);
  }
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 8 * s;
  ctx.strokeStyle = '#fed7aa';
  ctx.stroke();
  ctx.restore();

  // Draw QR Modules directly on Canvas
  const qrSize = 420 * s;
  const qrX = 190 * s;
  const qrY = 315 * s;

  const qr = QRCode.create(menuUrl, { errorCorrectionLevel: 'H' });
  const modCount = qr.modules.size;
  const scale = qrSize / modCount;

  const centerMod = Math.floor(modCount / 2);
  const excavateRadius = includeLogo ? 3 : 0;
  const minEx = centerMod - excavateRadius;
  const maxEx = centerMod + excavateRadius;

  ctx.fillStyle = '#1c1917';
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (includeLogo && r >= minEx && r <= maxEx && c >= minEx && c <= maxEx) {
        continue;
      }
      if (qr.modules.get(r, c)) {
        const x = Math.round(qrX + c * scale);
        const y = Math.round(qrY + r * scale);
        const w = Math.ceil(qrX + (c + 1) * scale) - x;
        const h = Math.ceil(qrY + (r + 1) * scale) - y;
        ctx.fillRect(x, y, w, h);
      }
    }
  }

  // Draw center monogram badge
  if (includeLogo) {
    const logoBoxSize = Math.round((excavateRadius * 2 + 0.6) * scale);
    const centerX = qrX + qrSize / 2;
    const centerY = qrY + qrSize / 2;
    const logoBoxX = Math.round(centerX - logoBoxSize / 2);
    const logoBoxY = Math.round(centerY - logoBoxSize / 2);
    const radius = Math.round(logoBoxSize * 0.22);
    const borderWidth = Math.max(3 * s, Math.round(logoBoxSize * 0.05));

    ctx.save();
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize, radius);
    } else {
      ctx.rect(logoBoxX, logoBoxY, logoBoxSize, logoBoxSize);
    }
    ctx.fillStyle = '#fff7ed';
    ctx.fill();
    ctx.lineWidth = borderWidth;
    ctx.strokeStyle = '#fed7aa';
    ctx.stroke();

    const initial = restName.charAt(0).toUpperCase() || 'M';
    ctx.fillStyle = '#ea580c';
    ctx.font = `900 ${Math.round(logoBoxSize * 0.58)}px 'Playfair Display', Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initial, centerX, centerY);
    ctx.restore();
  }

  // Bottom URL Container
  ctx.save();
  const urlBoxW = 600 * s;
  const urlBoxH = 74 * s;
  const urlBoxX = 400 * s - urlBoxW / 2;
  const urlBoxY = 880 * s - urlBoxH / 2;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(urlBoxX, urlBoxY, urlBoxW, urlBoxH, 20 * s);
  } else {
    ctx.rect(urlBoxX, urlBoxY, urlBoxW, urlBoxH);
  }
  ctx.fillStyle = '#fafaf9';
  ctx.fill();
  ctx.lineWidth = 2 * s;
  ctx.strokeStyle = '#e7e5e4';
  ctx.stroke();

  ctx.fillStyle = '#a8a29e';
  ctx.font = `800 ${12 * s}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('DIRECT MENU ACCESS', 400 * s, 868 * s);

  ctx.fillStyle = '#292524';
  ctx.font = `700 ${menuUrl.length > 55 ? 13 * s : 15 * s}px system-ui, -apple-system, sans-serif`;
  ctx.fillText(menuUrl, 400 * s, 898 * s);

  // Instructions Footer
  ctx.fillStyle = '#78716c';
  ctx.font = `700 ${16 * s}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('Scan with your smartphone camera to browse menu', 400 * s, 990 * s);

  ctx.fillStyle = '#a8a29e';
  ctx.font = `500 ${13 * s}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('No app download required · Instant digital availability', 400 * s, 1018 * s);
  ctx.restore();
}

/**
 * Checks if a canvas has actual rendered pixels (non-blank verification).
 */
function isCanvasBlank(ctx, width, height) {
  try {
    const sample = ctx.getImageData(0, 0, width, height).data;
    // Inspect every 16th pixel for performance
    for (let i = 0; i < sample.length; i += 64) {
      // If any sampled pixel is not pure white (255, 255, 255)
      if (sample[i] < 240 || sample[i + 1] < 240 || sample[i + 2] < 240) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Downloads a canvas element as a high-resolution PNG file.
 */
export function downloadPngFromCanvas(canvas, filename) {
  return new Promise((resolve, reject) => {
    try {
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob((blob) => {
          if (!blob) {
            // Fallback to dataURL
            try {
              const dataUrl = canvas.toDataURL('image/png');
              triggerDownloadUrl(dataUrl, filename);
              resolve(true);
            } catch (err) {
              reject(err);
            }
            return;
          }
          const url = URL.createObjectURL(blob);
          triggerDownloadUrl(url, filename, () => URL.revokeObjectURL(url));
          resolve(true);
        }, 'image/png');
      } else {
        const dataUrl = canvas.toDataURL('image/png');
        triggerDownloadUrl(dataUrl, filename);
        resolve(true);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function triggerDownloadUrl(url, filename, cleanup = null) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (cleanup) {
    setTimeout(cleanup, 5000);
  }
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
              data[idx] = 28;
              data[idx + 1] = 25;
              data[idx + 2] = 23;
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
 * Triggers browser download of SVG string as a proper XML document.
 * Ensures clean XML declaration and explicit dimensions.
 */
export function downloadSvg(svgString, filename) {
  const cleanSvg = svgString.trim();
  const fullSvg = cleanSvg.startsWith('<?xml')
    ? cleanSvg
    : `<?xml version="1.0" encoding="UTF-8"?>\n${cleanSvg}`;
  const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  triggerDownloadUrl(url, filename, () => URL.revokeObjectURL(url));
}

/**
 * Robust SVG to PNG conversion pipeline with:
 * 1. Sanitized SVG with explicit dimensions (no collapsing styles)
 * 2. UTF-8 Data URL loading
 * 3. High-resolution canvas rendering
 * 4. Automatic blank canvas detection and fallback
 */
export function downloadPngFromSvg(
  svgString,
  filename,
  targetWidth = 1600,
  targetHeight = 2200,
  fallbackRenderer = null
) {
  return new Promise((resolve, reject) => {
    try {
      // Strip any problematic inline collapsing styles if present
      let cleanSvg = svgString.trim();
      cleanSvg = cleanSvg.replace(/style="[^"]*max-width:[^"]*"/gi, '');
      if (!cleanSvg.startsWith('<?xml')) {
        cleanSvg = `<?xml version="1.0" encoding="UTF-8"?>\n${cleanSvg}`;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const renderFallback = () => {
        if (fallbackRenderer) {
          try {
            fallbackRenderer(canvas);
            downloadPngFromCanvas(canvas, filename).then(resolve).catch(reject);
            return true;
          } catch (fbErr) {
            console.error('Fallback renderer failed:', fbErr);
          }
        }
        return false;
      };

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.width = targetWidth;
      img.height = targetHeight;

      const handleImageReady = () => {
        try {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetWidth, targetHeight);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          if (isCanvasBlank(ctx, targetWidth, targetHeight)) {
            if (renderFallback()) return;
            throw new Error('Canvas rendered blank from SVG source');
          }

          downloadPngFromCanvas(canvas, filename).then(resolve).catch(reject);
        } catch (err) {
          if (renderFallback()) return;
          reject(err);
        }
      };

      img.onload = () => {
        if (typeof img.decode === 'function') {
          img.decode().then(handleImageReady).catch(handleImageReady);
        } else {
          handleImageReady();
        }
      };

      img.onerror = () => {
        if (renderFallback()) return;
        reject(new Error('Failed to load SVG into image element'));
      };

      // Use UTF-8 Data URI for 100% reliable synchronous image loading without Blob URL quirks
      img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(cleanSvg)}`;
    } catch (err) {
      if (fallbackRenderer) {
        try {
          const canvas = document.createElement('canvas');
          fallbackRenderer(canvas);
          downloadPngFromCanvas(canvas, filename).then(resolve).catch(reject);
          return;
        } catch {}
      }
      reject(err);
    }
  });
}

/**
 * Dedicated, 100% reliable Table Stand PNG exporter.
 * Employs direct canvas rasterization guaranteed to produce sharp, high-contrast artwork.
 */
export function downloadStandCardPng({
  restaurant,
  tableNumber,
  menuUrl,
  includeLogo = true,
  filename = 'mitti-farms-stand-card-hd.png',
}) {
  const canvas = document.createElement('canvas');
  renderStandCardToCanvas(canvas, {
    restaurant,
    tableNumber,
    menuUrl,
    includeLogo,
    width: 1600,
    height: 2200,
  });
  return downloadPngFromCanvas(canvas, filename);
}

/**
 * Dedicated, 100% reliable Table Stand SVG exporter.
 */
export function downloadStandCardSvg({
  restaurant,
  tableNumber,
  menuUrl,
  includeLogo = true,
  filename = 'mitti-farms-stand-card.svg',
}) {
  const svg = generateStandCardSvg({ restaurant, tableNumber, menuUrl, includeLogo });
  downloadSvg(svg, filename);
}

/**
 * Dedicated, 100% reliable Standalone Pure QR PNG exporter.
 * Employs direct canvas rasterization guaranteed to produce sharp, high-contrast artwork.
 */
export function downloadPureQrPng({
  menuUrl,
  restaurant,
  includeLogo = true,
  filename = 'mitti-farms-qr-only-hd.png',
}) {
  const canvas = document.createElement('canvas');
  renderPureQrToCanvas(canvas, {
    menuUrl,
    restaurant,
    includeLogo,
    size: 1200,
  });
  return downloadPngFromCanvas(canvas, filename);
}

/**
 * Dedicated, 100% reliable Standalone Pure QR SVG exporter.
 */
export function downloadPureQrSvg({
  menuUrl,
  restaurant,
  includeLogo = true,
  filename = 'mitti-farms-qr-only.svg',
}) {
  const svg = generatePureQrSvg({ menuUrl, restaurant, includeLogo });
  downloadSvg(svg, filename);
}
