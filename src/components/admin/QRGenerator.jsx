import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, QrCode } from 'lucide-react';
import { tables } from '../../data/sampleMenu';

const QRGenerator = () => {
  const qrRef = useRef(null);
  const [selectedTable, setSelectedTable] = useState('');

  const baseUrl = `${window.location.origin}/#/`;
  const menuUrl = selectedTable ? `${baseUrl}?table=${selectedTable}` : baseUrl;

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = `mitti-farms-qr${selectedTable ? `-table-${selectedTable}` : ''}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-surface-900 flex items-center justify-center gap-2">
          <QrCode className="text-brand-600" size={28} />
          QR Code Generator
        </h2>
        <p className="text-surface-500 text-sm">Generate QR codes for tables or the general menu.</p>
      </div>

      {/* Table selector */}
      <div className="bg-white rounded-2xl p-5 border border-surface-100 shadow-sm">
        <label className="block text-sm font-semibold text-surface-800 mb-2">Select Table (optional)</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTable('')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              !selectedTable ? 'bg-brand-500 text-white shadow-sm' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            General Menu
          </button>
          {tables.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTable(t.id)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                selectedTable === t.id ? 'bg-brand-500 text-white shadow-sm' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* QR Display */}
      <div className="flex flex-col items-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-surface-200 flex flex-col items-center max-w-sm w-full">
          <div className="w-full text-center mb-5">
            <h1 className="text-xl font-extrabold text-brand-900 tracking-tight uppercase">Mitti Farms</h1>
            <p className="text-[11px] font-semibold text-brand-700 tracking-wider uppercase -mt-0.5">Chulha Bistro</p>
            {selectedTable ? (
              <p className="text-sm font-bold text-brand-600 mt-1">🪑 Table {selectedTable}</p>
            ) : (
              <p className="text-xs font-medium text-surface-500 uppercase tracking-widest mt-1">Scan for Menu</p>
            )}
          </div>

          <div ref={qrRef} className="bg-white p-3 rounded-2xl border-4 border-brand-100 mb-5">
            <QRCodeSVG
              value={menuUrl}
              size={220}
              bgColor="#ffffff"
              fgColor="#1c1917"
              level="H"
              includeMargin={false}
            />
          </div>

          <div className="text-center w-full bg-surface-50 py-2.5 rounded-xl border border-surface-100">
            <p className="text-[10px] font-semibold text-surface-400 uppercase">Or visit</p>
            <p className="text-xs font-bold text-surface-800 truncate px-3">{menuUrl}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 w-full max-w-sm">
          <button onClick={handleDownload}
            className="flex-1 btn-outline flex items-center justify-center gap-2 py-3">
            <Download size={18} /> Download
          </button>
          <button onClick={() => window.print()}
            className="flex-1 btn-primary flex items-center justify-center gap-2 py-3">
            <Printer size={18} /> Print
          </button>
        </div>
      </div>

      {/* All tables preview */}
      <div className="bg-white rounded-2xl p-5 border border-surface-100 shadow-sm">
        <h3 className="font-bold text-surface-900 mb-4">All Table QR Codes</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tables.map((t) => (
            <div key={t.id} className="bg-surface-50 rounded-xl p-3 text-center border border-surface-100">
              <QRCodeSVG
                value={`${baseUrl}?table=${t.id}`}
                size={80}
                bgColor="#fafaf9"
                fgColor="#1c1917"
                level="M"
              />
              <p className="text-xs font-bold text-surface-800 mt-2">{t.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
