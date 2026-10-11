import QRCode from 'qrcode';

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

  // Center logo excavation bounds (about 18-20% of modules for safe scanning)
  const centerMod = Math.floor(modCount / 2);
  const excavateRadius = includeLogo ? 3 : 0; // 7x7 modules if logo included
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
  const qrSize = 440;
  const qrX = 180;
  const qrY = 310;
  const scale = qrSize / modCount;

  // Center logo dimensions
  const logoBoxSize = 92;
  const logoBoxX = 400 - logoBoxSize / 2;
  const logoBoxY = qrY + qrSize / 2 - logoBoxSize / 2;

  const tableLabel = tableNumber ? `Table ${tableNumber}` : 'Digital Menu';
  const tableSub = tableNumber ? 'Reserved Table Stand' : 'Scan for Food & Beverage Menu';

  // Sanitize texts for XML
  const escapeXml = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  const safeName = escapeXml(restName);
  const safeSub = escapeXml(restSub);
  const safeUrl = escapeXml(menuUrl);
  const safeTableLabel = escapeXml(tableLabel);
  const safeTableSub = escapeXml(tableSub);

  // Logo rendering: if image is http/data URI, embed as image; else render clean monogram
  let centerLogoSvg = '';
  if (includeLogo) {
    if (logoUrl && (logoUrl.startsWith('data:') || logoUrl.startsWith('http') || logoUrl.startsWith('/'))) {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="20" fill="#ffffff" stroke="#fed7aa" stroke-width="5" />
        <clipPath id="logoClip">
          <rect x="${logoBoxX + 4}" y="${logoBoxY + 4}" width="${logoBoxSize - 8}" height="${logoBoxSize - 8}" rx="16" />
        </clipPath>
        <image x="${logoBoxX + 4}" y="${logoBoxY + 4}" width="${logoBoxSize - 8}" height="${logoBoxSize - 8}" href="${escapeXml(logoUrl)}" clip-path="url(#logoClip)" preserveAspectRatio="xMidYMid slice" />
      `;
    } else {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="20" fill="#fff7ed" stroke="#fed7aa" stroke-width="5" />
        <text x="400" y="${logoBoxY + 63}" font-family="'Playfair Display', 'Fraunces', Georgia, serif" font-weight="900" font-size="48" fill="#ea580c" text-anchor="middle">${initial}</text>
      `;
    }
  }

  // Pure SVG string with responsive scaling attributes for 100% proper display
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1100" width="100%" height="auto" style="max-width: 100%; height: auto; display: block; aspect-ratio: 800/1100;">
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
  <text x="400" y="148" class="sans" font-weight="700" font-size="16" fill="#c2410c" text-anchor="middle" letter-spacing="3">${safeSub.toUpperCase()}</text>

  <!-- Table / Purpose Pill -->
  <g transform="translate(400, 195)">
    <rect x="-160" y="-22" width="320" height="48" rx="24" fill="${tableNumber ? '#fff7ed' : '#f5f5f4'}" stroke="${tableNumber ? '#fdba74' : '#d6d3d1'}" stroke-width="2" />
    <text x="0" y="8" class="sans" font-weight="800" font-size="${tableNumber ? '22' : '17'}" fill="${tableNumber ? '#c2410c' : '#44403c'}" text-anchor="middle">${safeTableLabel}</text>
  </g>
  <text x="400" y="252" class="sans" font-weight="600" font-size="14" fill="#a8a29e" text-anchor="middle">${safeTableSub}</text>

  <!-- QR Frame Outer Container with Warm Brand Border -->
  <rect x="136" y="276" width="528" height="528" rx="32" fill="#ffffff" stroke="#fed7aa" stroke-width="8" />
  <rect x="156" y="296" width="488" height="488" rx="20" fill="#ffffff" />

  <!-- QR Code Modules (Sharp Vector Paths) -->
  <g transform="translate(${qrX}, ${qrY}) scale(${scale})">
    <path d="${pathD}" fill="#1c1917" shape-rendering="crispEdges" />
  </g>

  <!-- Center Logo Badge -->
  ${centerLogoSvg}

  <!-- Bottom URL Info Container -->
  <g transform="translate(400, 880)">
    <rect x="-270" y="-36" width="540" height="74" rx="20" fill="#fafaf9" stroke="#e7e5e4" stroke-width="2" />
    <text x="0" y="-12" class="sans" font-weight="800" font-size="12" fill="#a8a29e" text-anchor="middle" letter-spacing="2">DIRECT MENU ACCESS</text>
    <text x="0" y="18" class="sans" font-weight="700" font-size="16" fill="#292524" text-anchor="middle">${safeUrl}</text>
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

  const logoBoxSize = scale * 7.5;
  const logoBoxX = viewSize / 2 - logoBoxSize / 2;
  const logoBoxY = viewSize / 2 - logoBoxSize / 2;

  const escapeXml = (str) =>
    String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');

  let centerLogoSvg = '';
  if (includeLogo) {
    if (logoUrl && (logoUrl.startsWith('data:') || logoUrl.startsWith('http') || logoUrl.startsWith('/'))) {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${logoBoxSize * 0.22}" fill="#ffffff" stroke="#fed7aa" stroke-width="${logoBoxSize * 0.05}" />
        <clipPath id="pureLogoClip">
          <rect x="${logoBoxX + 4}" y="${logoBoxY + 4}" width="${logoBoxSize - 8}" height="${logoBoxSize - 8}" rx="${logoBoxSize * 0.18}" />
        </clipPath>
        <image x="${logoBoxX + 4}" y="${logoBoxY + 4}" width="${logoBoxSize - 8}" height="${logoBoxSize - 8}" href="${escapeXml(logoUrl)}" clip-path="url(#pureLogoClip)" preserveAspectRatio="xMidYMid slice" />
      `;
    } else {
      centerLogoSvg = `
        <rect x="${logoBoxX}" y="${logoBoxY}" width="${logoBoxSize}" height="${logoBoxSize}" rx="${logoBoxSize * 0.22}" fill="#fff7ed" stroke="#fed7aa" stroke-width="${logoBoxSize * 0.05}" />
        <text x="${viewSize / 2}" y="${logoBoxY + logoBoxSize * 0.72}" font-family="'Playfair Display', 'Fraunces', Georgia, serif" font-weight="900" font-size="${logoBoxSize * 0.6}" fill="#ea580c" text-anchor="middle">${initial}</text>
      `;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewSize} ${viewSize}" width="100%" height="100%" style="max-width: 100%; height: auto; display: block; aspect-ratio: 1/1;">
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
 * Triggers browser download of SVG string
 */
export function downloadSvg(svgString, filename) {
  const fullSvg = svgString.includes('<?xml')
    ? svgString
    : `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
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
 * Converts SVG to high-resolution PNG (default 1600x2200 for stand, 1600x1600 for pure QR)
 * guaranteeing crisp printing with sharp edges.
 */
export function downloadPngFromSvg(svgString, filename, targetWidth = 1600, targetHeight = 2200) {
  return new Promise((resolve, reject) => {
    try {
      const standaloneSvg = svgString.includes('<?xml')
        ? svgString
        : `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;

      const blob = new Blob([standaloneSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');

          // High quality image rendering
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          // Ensure solid white background behind artwork
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          URL.revokeObjectURL(url);

          canvas.toBlob((pngBlob) => {
            if (!pngBlob) {
              reject(new Error('Canvas export failed'));
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
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        // Resilient fallback with Data URL encoding
        try {
          const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(standaloneSvg)}`;
          const imgFallback = new Image();
          imgFallback.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(imgFallback, 0, 0, targetWidth, targetHeight);
            canvas.toBlob((pngBlob) => {
              if (!pngBlob) {
                return reject(new Error('Canvas fallback export failed'));
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
          imgFallback.onerror = (e) => {
            reject(new Error('Failed to load SVG into canvas for PNG generation'));
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
