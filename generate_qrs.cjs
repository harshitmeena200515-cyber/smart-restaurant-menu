const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');

const outputDir = path.join(__dirname, 'public', 'qr-codes');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const baseUrl = 'https://harshitmeena200515-cyber.github.io/smart-restaurant-menu/';

async function generate() {
  console.log('Generating QR Barcodes for Mitti Farms...');

  // 1. General Menu Barcode
  const mainFile = path.join(outputDir, 'mitti-farms-main-qr.png');
  await QRCode.toFile(mainFile, baseUrl, {
    width: 600,
    margin: 2,
    color: {
      dark: '#1c1917',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
  console.log('Created:', mainFile);

  // 2. Tables 01 to 12
  for (let i = 1; i <= 12; i++) {
    const tableId = String(i).padStart(2, '0');
    const tableUrl = `${baseUrl}#/?table=${tableId}`;
    const tableFile = path.join(outputDir, `table-${tableId}-qr.png`);
    await QRCode.toFile(tableFile, tableUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: '#1c1917',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    console.log(`Created Table ${tableId}:`, tableFile);
  }

  console.log('All QR barcodes generated successfully!');
}

generate().catch(console.error);
