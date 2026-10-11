import React, { useState, useRef } from 'react';
import { 
  Building2, Image as ImageIcon, Upload, Trash2, Check, 
  ExternalLink, MapPin, Phone, Globe, Sparkles, RefreshCw, AlertCircle, Eye
} from 'lucide-react';
import useMenuStore from '../../store/menuStore';
import { toast } from '../../store/toastStore';
import { processUploadedImage } from '../../utils/imageUtils';

export const BrandingManager = () => {
  const restaurant = useMenuStore((s) => s.restaurant);
  const updateRestaurant = useMenuStore((s) => s.updateRestaurant);

  const [formData, setFormData] = useState({
    name: restaurant.name || 'Mitti Farms',
    subname: restaurant.subname || 'Farmstay & Dining',
    tagline: restaurant.tagline || 'Farm Fresh · Organic · Rural Dining',
    description: restaurant.description || '',
    logo: restaurant.logo || '',
    address: restaurant.address || 'Atari-Jethian-Tapovan-Banganga Rd, Aer, Bikaipur, Bihar 823311',
    phone: restaurant.phone || '+91 87097 85250',
    mapsUrl: restaurant.mapsUrl || 'https://maps.app.goo.gl/hfSZ3f2jdc53tvbx7',
    websiteUrl: restaurant.websiteUrl || 'https://mitti-farms.grexa.site/',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [logoInputType, setLogoInputType] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    try {
      // Process and compress logo for fast mobile load and safe localStorage persistence
      const dataUrl = await processUploadedImage(file, 400, 400, 0.85);
      setFormData((prev) => ({ ...prev, logo: dataUrl }));
      toast.success('Logo loaded! Click "Save Restaurant Settings" to apply permanently.');
    } catch (err) {
      toast.error('Failed to process image: ' + err.message);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveLogo = () => {
    setFormData((prev) => ({ ...prev, logo: '' }));
    toast.info('Logo removed. The header will show a clean text initial placeholder.');
  };

  const handleResetToDefault = () => {
    setFormData({
      name: 'Mitti Farms',
      subname: 'Farmstay & Dining',
      tagline: 'Farm Fresh · Organic · Rural Dining',
      description:
        'An eco-friendly farmstay and dining haven situated on the scenic Gaya-Rajgir circuit. Our kitchen crafts wholesome, farm-fresh delicacies prepared with organic ingredients harvested right from our fields.',
      logo: '',
      address: 'Atari-Jethian-Tapovan-Banganga Rd, Aer, Bikaipur, Bihar 823311',
      phone: '+91 87097 85250',
      mapsUrl: 'https://maps.app.goo.gl/hfSZ3f2jdc53tvbx7',
      websiteUrl: 'https://mitti-farms.grexa.site/',
    });
    toast.info('Reset fields to default "Mitti Farms" identity. Click Save to apply.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Restaurant name cannot be empty');
      return;
    }

    updateRestaurant(formData);
    toast.success('Restaurant settings and logo saved permanently!');
  };

  const isLogoImage = formData.logo && (
    formData.logo.startsWith('data:') || 
    formData.logo.startsWith('http') || 
    formData.logo.startsWith('/')
  );

  const letterPlaceholder = formData.name?.trim() ? formData.name.trim().charAt(0).toUpperCase() : 'M';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-surface-900 flex items-center gap-2">
            <Building2 className="text-brand-600" size={24} />
            Restaurant Settings
          </h2>
          <p className="text-sm text-surface-500 mt-1">
            Configure the restaurant display name, header logo or profile image, and location details.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetToDefault}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-surface-200 hover:bg-surface-50 text-xs font-semibold text-surface-600 transition-colors self-start sm:self-center"
        >
          <RefreshCw size={13} />
          Reset to Default (Mitti Farms)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Live Header Preview Card */}
        <div className="bg-stone-950 p-6 rounded-2xl border border-stone-800 shadow-lg text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Eye size={13} /> Live Header Preview (Customer Website)
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Live Preview
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-stone-900/90 border border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Header Logo or Neutral Monogram Placeholder */}
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/40 flex items-center justify-center text-xl shadow-inner overflow-hidden shrink-0">
                {isLogoImage ? (
                  <img
                    src={formData.logo}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif font-black text-amber-300 text-lg select-none">
                    {letterPlaceholder}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-black text-lg sm:text-xl text-white">
                    {formData.name || 'Mitti Farms'}
                  </span>
                  {formData.subname && (
                    <span className="text-[10px] font-sans font-bold tracking-wide px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {formData.subname}
                    </span>
                  )}
                </div>
                <p className="text-stone-400 text-xs mt-0.5 font-medium">
                  {formData.tagline || 'Farm Fresh · Organic · Rural Dining'}
                </p>
              </div>
            </div>

            <div className="hidden md:block text-right">
              <span className="text-[11px] text-stone-400 block">Current Status</span>
              <span className="text-xs text-amber-300 font-medium">
                {isLogoImage ? 'Custom Logo Active' : 'Neutral Monogram Placeholder'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Restaurant Name & Identity */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs space-y-4">
          <div className="border-b border-surface-100 pb-3">
            <h3 className="font-bold text-surface-900 text-base">
              1. Restaurant Display Name & Branding
            </h3>
            <p className="text-xs text-surface-500 mt-0.5">
              This name appears across the customer website, top header, order tickets, and receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-surface-700 block mb-1">
                Restaurant Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Mitti Farms"
                className="w-full px-4 py-2.5 rounded-xl border border-surface-300 text-sm font-bold text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white shadow-xs"
              />
              <span className="text-[11px] text-surface-500 block mt-1">
                Default: <strong>Mitti Farms</strong>. Any change saved here immediately updates the website and persists across refreshes.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-surface-700 block mb-1">
                Subname / Subtitle (Optional)
              </label>
              <input
                type="text"
                value={formData.subname}
                onChange={(e) => setFormData((prev) => ({ ...prev, subname: e.target.value }))}
                placeholder="Farmstay & Dining"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-xs font-semibold text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <span className="text-[10px] text-surface-400 block mt-1">
                Shown as a discreet badge beside the restaurant name
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-surface-700 block mb-1">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData((prev) => ({ ...prev, tagline: e.target.value }))}
                placeholder="Farm Fresh · Organic · Rural Dining"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-surface-700 block mb-1">
                About / Description
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="An eco-friendly farmstay and dining haven situated on the scenic Gaya-Rajgir circuit..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Logo / Restaurant Image Upload */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-100 pb-3">
            <div>
              <h3 className="font-bold text-surface-900 text-base flex items-center gap-2">
                <ImageIcon size={18} className="text-brand-600" />
                2. Restaurant Logo / Profile Image
              </h3>
              <p className="text-xs text-surface-500 mt-0.5">
                Upload your official logo or restaurant image to appear in the website header.
              </p>
            </div>
            {formData.logo && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 self-start sm:self-center"
              >
                <Trash2 size={13} />
                Remove Logo
              </button>
            )}
          </div>

          {/* Current Logo / Placeholder Status Card */}
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-200 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-surface-200 shadow-xs flex items-center justify-center overflow-hidden shrink-0">
              {isLogoImage ? (
                <img
                  src={formData.logo}
                  alt="Logo preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="font-serif font-black text-2xl text-stone-600">
                    {letterPlaceholder}
                  </span>
                  <span className="text-[9px] text-stone-400 uppercase tracking-wider font-semibold">Placeholder</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <h4 className="text-xs font-bold text-surface-900">
                {isLogoImage ? 'Custom Restaurant Logo Active' : 'Neutral Monogram Placeholder'}
              </h4>
              <p className="text-[11px] text-surface-500 mt-0.5">
                {isLogoImage 
                  ? 'Your uploaded logo is ready to display in the website header.' 
                  : 'No custom image uploaded yet. A clean text-based letter placeholder is currently shown.'}
              </p>
              {isLogoImage && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-bold inline-flex items-center gap-1"
                >
                  <Upload size={12} />
                  Change / Replace Image
                </button>
              )}
            </div>
          </div>

          {/* Upload Method Tabs */}
          <div className="flex gap-2 border-b border-surface-200 pb-2">
            <button
              type="button"
              onClick={() => setLogoInputType('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                logoInputType === 'upload'
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-surface-500 hover:text-surface-800'
              }`}
            >
              Upload Logo File (Device)
            </button>
            <button
              type="button"
              onClick={() => setLogoInputType('url')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                logoInputType === 'url'
                  ? 'bg-brand-50 text-brand-700 border border-brand-200'
                  : 'text-surface-500 hover:text-surface-800'
              }`}
            >
              Or Enter Image URL
            </button>
          </div>

          {logoInputType === 'upload' ? (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleFileUpload}
                className="hidden"
                id="admin-logo-upload"
              />
              <label
                htmlFor="admin-logo-upload"
                className="cursor-pointer border-2 border-dashed border-surface-300 hover:border-brand-500 rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all bg-surface-50 hover:bg-brand-50/30 group"
              >
                <div className="w-12 h-12 rounded-full bg-brand-100 group-hover:bg-brand-200 text-brand-600 flex items-center justify-center transition-colors">
                  <Upload size={20} />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-surface-900">
                    {isProcessing ? 'Processing image...' : (formData.logo ? 'Click to select a different image' : 'Upload Logo / Restaurant Image')}
                  </p>
                  <p className="text-[11px] text-surface-400 mt-0.5">
                    Supports PNG, JPG, WebP, SVG (Square ratio recommended)
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-surface-700 block">
                Direct Image URL
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                placeholder="https://example.com/mitti-farms-logo.png"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          )}
        </div>

        {/* Section 3: Location & External Reference Links */}
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-xs space-y-4">
          <div className="border-b border-surface-100 pb-3">
            <h3 className="font-bold text-surface-900 text-base">
              3. Location & Reference Links
            </h3>
            <p className="text-xs text-surface-500 mt-0.5">
              Verified coordinates and official links from your provided references.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-surface-700 block mb-1">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-surface-700 block mb-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-brand-600" />
                Google Maps URL
              </label>
              <input
                type="url"
                value={formData.mapsUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, mapsUrl: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-surface-700 block mb-1 flex items-center gap-1.5">
                <Globe size={13} className="text-brand-600" />
                Website URL
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData((prev) => ({ ...prev, websiteUrl: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-200 text-xs text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Submit & Save Changes Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-surface-500">
            Changes save to persistent storage and apply instantly to the customer menu.
          </p>
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Check size={18} />
            Save Restaurant Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandingManager;
