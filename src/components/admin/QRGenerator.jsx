import React, { useState, useMemo } from 'react';
import { Download, Printer, QrCode, FileText, Image as ImageIcon, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { tables } from '../../data/sampleMenu';
import useMenuStore from '../../store/menuStore';
import {
  generateStandCardSvg,
  generatePureQrSvg,
  downloadSvg,
  downloadPngFromSvg,
} from '../../utils/qrExportUtils';
import { toast } from '../../store/toastStore';

const QRGenerator = () => {
  const restaurant = useMenuStore((s) => s.restaurant);
  const [selectedTable, setSelectedTable] = useState('');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [previewMode, setPreviewMode] = useState('stand'); // 'stand' or 'pure'

  // Maintain original destination URL including hash and query parameters
  const baseUrl = `${window.location.origin}/#/`;
  const menuUrl = selectedTable ? `${baseUrl}?table=${selectedTable}` : baseUrl;

  // Generate the exact stand card SVG string
  const standCardSvg = useMemo(() => {
    return generateStandCardSvg({
      restaurant,
      tableNumber: selectedTable,
      menuUrl,
      includeLogo,
    });
  }, [restaurant, selectedTable, menuUrl, includeLogo]);

  // Generate pure standalone QR SVG string
  const pureQrSvg = useMemo(() => {
    return generatePureQrSvg({
      menuUrl,
      restaurant,
      includeLogo,
    });
  }, [menuUrl, restaurant, includeLogo]);

  const baseFileName = `mitti-farms-menu${selectedTable ? `-table-${selectedTable}` : ''}`;

  // Download High-Resolution Table Stand Card as PNG
  const handleDownloadStandPng = async () => {
    setIsExporting(true);
    try {
      const filename = `${baseFileName}-stand-card-hd.png`;
      await downloadPngFromSvg(standCardSvg, filename, 1600, 2200);
      toast.success(`✅ Downloaded High-Res Stand Card PNG (1600×2200)`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PNG: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Download Table Stand Card as Scalable Vector SVG
  const handleDownloadStandSvg = () => {
    try {
      const filename = `${baseFileName}-stand-card.svg`;
      downloadSvg(standCardSvg, filename);
      toast.success(`✅ Downloaded Scalable Vector Stand Card SVG`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export SVG');
    }
  };

  // Download Pure Standalone QR as PNG
  const handleDownloadPurePng = async () => {
    setIsExporting(true);
    try {
      const filename = `${baseFileName}-qr-only-hd.png`;
      await downloadPngFromSvg(pureQrSvg, filename, 1200, 1200);
      toast.success(`✅ Downloaded Clean High-Res QR PNG (1200×1200)`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export QR PNG: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  // Download Pure Standalone QR as SVG
  const handleDownloadPureSvg = () => {
    try {
      const filename = `${baseFileName}-qr-only.svg`;
      downloadSvg(pureQrSvg, filename);
      toast.success(`✅ Downloaded Scalable Vector QR SVG`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to export QR SVG');
    }
  };

  // Quick download for individual table card in the grid below
  const handleQuickDownloadTable = async (tableId, format) => {
    const tableUrl = `${baseUrl}?table=${tableId}`;
    const svgStr = generateStandCardSvg({
      restaurant,
      tableNumber: tableId,
      menuUrl: tableUrl,
      includeLogo,
    });
    const filename = `mitti-farms-table-${tableId}.${format}`;
    if (format === 'svg') {
      downloadSvg(svgStr, filename);
      toast.success(`Table ${tableId} SVG downloaded`);
    } else {
      await downloadPngFromSvg(svgStr, filename, 1600, 2200);
      toast.success(`Table ${tableId} PNG downloaded`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-surface-900 flex items-center justify-center gap-2">
          <QrCode className="text-brand-600" size={28} />
          <span>High-Resolution QR Code &amp; Table Stand Generator</span>
        </h2>
        <p className="text-surface-500 text-sm max-w-xl mx-auto">
          Export pixel-perfect QR artwork matching your on-screen stand card. Generates razor-sharp 300&nbsp;DPI PNGs and scalable SVGs for tabletop acrylic stands, stickers, and tent cards.
        </p>
      </div>

      {/* Table Selector & Settings Bar */}
      <div className="bg-white rounded-2xl p-5 border border-surface-200 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-surface-800 mb-2">
            Select Table / Seat Identifier:
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTable('')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                !selectedTable
                  ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-600/30'
                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
              }`}
            >
              General Menu (No Table)
            </button>
            {tables.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTable(t.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  selectedTable === t.id
                    ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-600/30'
                    : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Options Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-surface-100 text-xs text-surface-600">
          <label className="inline-flex items-center gap-2 cursor-pointer font-medium select-none">
            <input
              type="checkbox"
              checked={includeLogo}
              onChange={(e) => setIncludeLogo(e.target.checked)}
              className="w-4 h-4 accent-brand-600 rounded cursor-pointer"
            />
            <span>Embed Restaurant Logo / Monogram in QR Center (Excavated for 100% scan safety)</span>
          </label>

          <span className="text-[11px] font-mono text-surface-400 truncate max-w-xs">
            URL: {menuUrl}
          </span>
        </div>
      </div>

      {/* Side-by-side: Visual Preview and Download Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* On-Screen Card Preview (Renders the EXACT vector SVG so downloaded file matches 100%) */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-bold text-surface-600 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-brand-600" />
              Live Preview (Exact Export Match)
            </span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} />
              Verified Scannable
            </span>
          </div>

          {/* Preview Mode Switcher Tabs */}
          <div className="w-full max-w-sm flex bg-stone-200/80 p-1 rounded-xl mb-3 text-xs font-bold gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setPreviewMode('stand')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                previewMode === 'stand'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🪑</span>
              <span>Table Stand Artwork</span>
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('pure')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                previewMode === 'pure'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>📱</span>
              <span>Standalone QR Code</span>
            </button>
          </div>

          {/* SVG Preview Container with Responsive Scaling */}
          <div className="w-full max-w-sm bg-stone-100/60 p-3 sm:p-4 rounded-[2rem] border border-stone-200 shadow-xl flex flex-col items-center">
            <div
              className="w-full overflow-hidden rounded-2xl shadow-md border border-stone-200/90 bg-white flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
              dangerouslySetInnerHTML={{ __html: previewMode === 'stand' ? standCardSvg : pureQrSvg }}
            />
          </div>

          <p className="text-[11px] text-surface-400 text-center mt-2.5">
            {previewMode === 'stand'
              ? 'Complete printable artwork with header, branding, table number, and QR code.'
              : 'Isolated high-resolution QR code with quiet zone whitespace for custom print layouts.'}
          </p>
        </div>

        {/* Download Buttons and Quality Info */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Card Export Card */}
          <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm space-y-4">
            <div className="border-b border-surface-100 pb-3">
              <h3 className="font-bold text-surface-900 text-base flex items-center gap-2">
                <FileText className="text-brand-600" size={18} />
                Table Stand Artwork Export
              </h3>
              <p className="text-xs text-surface-500 mt-0.5">
                Complete printable artwork with header, restaurant branding, table number, and QR code.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadStandPng}
                disabled={isExporting}
                className="btn-primary py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm shadow-md"
              >
                <Download size={16} />
                <span>Download PNG (1600px HD)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadStandSvg}
                className="btn-outline py-3.5 px-4 flex items-center justify-center gap-2 font-bold text-sm"
              >
                <Download size={16} />
                <span>Download Vector SVG</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl border border-surface-200 hover:bg-surface-50 text-surface-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Printer size={15} />
              <span>Print Directly from Browser</span>
            </button>
          </div>

          {/* Standalone QR Code Only Export */}
          <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm space-y-4">
            <div className="border-b border-surface-100 pb-3">
              <h3 className="font-bold text-surface-900 text-base flex items-center gap-2">
                <ImageIcon className="text-brand-600" size={18} />
                Standalone QR Code Only
              </h3>
              <p className="text-xs text-surface-500 mt-0.5">
                Isolated QR code with white margin/quiet zone for custom graphic designs, posters, or menus.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleDownloadPurePng}
                disabled={isExporting}
                className="btn-outline py-3 px-4 flex items-center justify-center gap-2 font-bold text-xs"
              >
                <Download size={15} />
                <span>Pure QR (PNG 1200px)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPureSvg}
                className="btn-outline py-3 px-4 flex items-center justify-center gap-2 font-bold text-xs"
              >
                <Download size={15} />
                <span>Pure QR (Vector SVG)</span>
              </button>
            </div>
          </div>

          {/* Verification & Printing Specs Badge */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs">
            <h4 className="font-bold text-amber-900 flex items-center gap-1.5">
              <Check size={15} className="text-amber-700 stroke-[3]" />
              Production &amp; Print Specifications
            </h4>
            <ul className="text-amber-800 space-y-1 list-disc list-inside">
              <li>High-Resolution export at 1600&times;2200 pixels ensures sharp printing on A5, A6, and acrylic table stands.</li>
              <li>QR error correction level <span className="font-mono font-bold">Level H</span> (30% recovery) ensures reliable scanning under restaurant lighting.</li>
              <li>Quiet zone whitespace padding is preserved to prevent scanning distortion.</li>
              <li>Destination URL correctly preserves table number parameters: <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">{menuUrl}</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grid of All Table QR Codes */}
      <div className="bg-white rounded-2xl p-6 border border-surface-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <div>
            <h3 className="font-bold text-surface-900 text-base">All Table QR Codes (Batch View)</h3>
            <p className="text-xs text-surface-500 mt-0.5">Quickly select or download individual table stands for your dining area.</p>
          </div>
          <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
            {tables.length} Tables Configured
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {tables.map((t) => {
            const tableUrl = `${baseUrl}?table=${t.id}`;
            const miniSvg = generatePureQrSvg({
              menuUrl: tableUrl,
              restaurant,
              includeLogo: true,
            });

            return (
              <div
                key={t.id}
                className={`p-3.5 rounded-2xl border transition-all text-center flex flex-col items-center justify-between ${
                  selectedTable === t.id
                    ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20 shadow-sm'
                    : 'border-surface-200 bg-surface-50/70 hover:border-surface-300'
                }`}
              >
                <div
                  className="w-24 h-24 bg-white rounded-xl p-1.5 shadow-2xs border border-surface-200/80 mb-2 overflow-hidden cursor-pointer flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:block"
                  onClick={() => setSelectedTable(t.id)}
                  title={`Preview Table ${t.id}`}
                  dangerouslySetInnerHTML={{ __html: miniSvg }}
                />

                <p className="text-xs font-bold text-surface-900">{t.label}</p>
                <p className="text-[10px] text-surface-400 font-mono">?table={t.id}</p>

                <div className="flex items-center gap-1.5 mt-2.5 w-full">
                  <button
                    type="button"
                    onClick={() => handleQuickDownloadTable(t.id, 'png')}
                    className="flex-1 py-1 rounded-lg bg-white border border-surface-200 hover:bg-brand-50 hover:text-brand-700 text-[11px] font-bold text-surface-700 transition-colors shadow-2xs"
                    title={`Download PNG for Table ${t.id}`}
                  >
                    PNG
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDownloadTable(t.id, 'svg')}
                    className="flex-1 py-1 rounded-lg bg-white border border-surface-200 hover:bg-brand-50 hover:text-brand-700 text-[11px] font-bold text-surface-700 transition-colors shadow-2xs"
                    title={`Download SVG for Table ${t.id}`}
                  >
                    SVG
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
