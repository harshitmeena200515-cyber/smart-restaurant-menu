import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Link as LinkIcon, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import useMenuStore from '../../store/menuStore';
import { processUploadedImage, getProductImageUrl, getCategoryFallback } from '../../utils/imageUtils';
import { toast } from '../../store/toastStore';

const ItemForm = ({ item, isOpen, onClose }) => {
  const categories = useMenuStore((s) => s.categories);
  const customizationGroups = useMenuStore((s) => s.customizationGroups);
  const addItem = useMenuStore((s) => s.addItem);
  const updateItem = useMenuStore((s) => s.updateItem);

  const fileInputRef = useRef(null);
  const [imageTab, setImageTab] = useState('upload'); // 'upload' or 'url'
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [imageError, setImageError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    hasPortions: false,
    priceHalf: '',
    priceFull: '',
    category: categories[0]?.id || 'starters',
    image: '',
    isVeg: true,
    isSpicy: false,
    spiceLevel: 0,
    isFeatured: false,
    isAvailable: true,
    customizationGroupIds: [],
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage('');
      setImageError('');
      setIsProcessingImage(false);

      if (item) {
        const existingImg = getProductImageUrl(item.image, item.category, item.id, item.name);
        setFormData({
          name: item.name || '',
          description: item.description || '',
          price: item.price !== undefined ? String(item.price) : '',
          hasPortions: Boolean(item.hasPortions),
          priceHalf: item.priceHalf !== undefined && item.priceHalf !== null ? String(item.priceHalf) : '',
          priceFull: item.priceFull !== undefined && item.priceFull !== null ? String(item.priceFull) : (item.price !== undefined ? String(item.price) : ''),
          category: item.category || categories[0]?.id || 'starters',
          image: item.image || '',
          isVeg: item.isVeg !== undefined ? item.isVeg : true,
          isSpicy: Boolean(item.isSpicy),
          spiceLevel: item.spiceLevel || 0,
          isFeatured: Boolean(item.isFeatured),
          isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
          customizationGroupIds: item.customizationGroupIds || [],
        });
        setImagePreview(existingImg);
        setImageTab(item.image?.startsWith('http') ? 'url' : 'upload');
      } else {
        const defaultCat = categories[0]?.id || 'starters';
        setFormData({
          ...emptyForm,
          category: defaultCat,
        });
        setImagePreview(getCategoryFallback(defaultCat));
        setImageTab('upload');
      }
    }
  }, [item, isOpen, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrorMessage('');

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };

      if (name === 'category' && !prev.image) {
        setImagePreview(getCategoryFallback(value));
      }

      return next;
    });

    if (name === 'image') {
      setImagePreview(value.trim() || getCategoryFallback(formData.category));
      setImageError('');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError('');
    setErrorMessage('');
    setIsProcessingImage(true);

    try {
      // Compress with 640x480 max bounds and 0.75 quality for rapid storage and low footprint
      const dataUrl = await processUploadedImage(file, 640, 480, 0.75);
      setFormData((prev) => ({ ...prev, image: dataUrl }));
      setImagePreview(dataUrl);
      toast.info('📸 Photo processed successfully');
    } catch (err) {
      const errTxt = err.message || 'Failed to process gallery image';
      setImageError(errTxt);
      toast.error(errTxt);
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: '' }));
    setImagePreview(getCategoryFallback(formData.category));
    setImageError('');
  };

  const handleCustomizationToggle = (groupId) => {
    setFormData((prev) => {
      const ids = prev.customizationGroupIds || [];
      return {
        ...prev,
        customizationGroupIds: ids.includes(groupId)
          ? ids.filter((id) => id !== groupId)
          : [...ids, groupId],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Strict validation
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setErrorMessage('Please enter an item name.');
      toast.error('Item name is required');
      return;
    }

    const hasPortions = Boolean(formData.hasPortions);
    let priceNum = 0;
    let halfNum = null;
    let fullNum = null;

    if (hasPortions) {
      halfNum = parseFloat(formData.priceHalf);
      fullNum = parseFloat(formData.priceFull);

      if (formData.priceHalf === '' || isNaN(halfNum) || halfNum < 0) {
        setErrorMessage('Please enter a valid Half portion price (₹0 or greater).');
        toast.error('Valid Half portion price is required');
        return;
      }

      if (formData.priceFull === '' || isNaN(fullNum) || fullNum < 0) {
        setErrorMessage('Please enter a valid Full portion price (₹0 or greater).');
        toast.error('Valid Full portion price is required');
        return;
      }

      priceNum = fullNum;
    } else {
      priceNum = parseFloat(formData.price);
      if (formData.price === '' || isNaN(priceNum) || priceNum < 0) {
        setErrorMessage('Please enter a valid price (₹0 or greater).');
        toast.error('Valid price is required');
        return;
      }
    }

    try {
      const cleanImage = formData.image?.trim() || '';

      const payload = {
        name: trimmedName,
        description: formData.description.trim(),
        price: priceNum,
        hasPortions,
        priceHalf: hasPortions ? halfNum : null,
        priceFull: hasPortions ? fullNum : null,
        category: formData.category,
        image: cleanImage,
        isVeg: Boolean(formData.isVeg),
        isSpicy: Boolean(formData.isSpicy),
        spiceLevel: formData.isSpicy ? parseInt(formData.spiceLevel, 10) || 1 : 0,
        isFeatured: Boolean(formData.isFeatured),
        isAvailable: Boolean(formData.isAvailable),
        customizationGroupIds: formData.customizationGroupIds || [],
      };

      if (item) {
        const updated = updateItem(item.id, payload);
        if (!updated) {
          throw new Error('Could not find item to update');
        }
        toast.success(`✅ "${trimmedName}" updated successfully!`);
      } else {
        const added = addItem(payload);
        if (!added) {
          throw new Error('Failed to create new item');
        }
        toast.success(`🎉 "${trimmedName}" added to menu!`);
      }

      onClose();
    } catch (err) {
      console.error('Error saving item:', err);
      setErrorMessage(err.message || 'Failed to save item. Please try again.');
      toast.error('Save failed. Please check inputs and retry.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-6 sm:my-8 overflow-hidden border border-surface-200">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-5 border-b border-surface-100 bg-surface-50">
          <div>
            <h2 className="text-xl font-bold text-surface-900">
              {item ? 'Edit Menu Item' : 'Add New Item'}
            </h2>
            <p className="text-xs text-surface-500 mt-0.5">
              {item ? 'Update dish name, price, photo, or details' : 'Add a fresh item to your live restaurant menu'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-surface-400 hover:text-surface-700 rounded-full hover:bg-surface-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">
                  Item Name * <span className="text-xs font-normal text-surface-400">(डिश का नाम)</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Tandoori Roti"
                />
              </div>

              {/* Portion Sizes Toggle & Pricing */}
              <div className="bg-surface-50 p-3.5 rounded-xl border border-surface-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-bold text-surface-800 block cursor-pointer" htmlFor="portionToggle">
                      Portion Sizes (Half &amp; Full)
                    </label>
                    <span className="text-[11px] text-surface-500">
                      Enable if this dish comes in Half and Full options
                    </span>
                  </div>
                  <input
                    id="portionToggle"
                    type="checkbox"
                    name="hasPortions"
                    checked={Boolean(formData.hasPortions)}
                    onChange={handleChange}
                    className="w-5 h-5 accent-brand-600 rounded cursor-pointer"
                  />
                </div>

                {formData.hasPortions ? (
                  <div className="space-y-2 pt-2 border-t border-surface-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-amber-800 mb-1">
                          Half Price (₹) *
                        </label>
                        <input
                          type="number"
                          name="priceHalf"
                          required={formData.hasPortions}
                          min="0"
                          step="any"
                          value={formData.priceHalf}
                          onChange={handleChange}
                          className="input-field font-bold text-amber-800 text-sm bg-white"
                          placeholder="120"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-orange-800 mb-1">
                          Full Price (₹) *
                        </label>
                        <input
                          type="number"
                          name="priceFull"
                          required={formData.hasPortions}
                          min="0"
                          step="any"
                          value={formData.priceFull}
                          onChange={handleChange}
                          className="input-field font-bold text-orange-800 text-sm bg-white"
                          placeholder="220"
                        />
                      </div>
                    </div>
                    <div className="text-[11px] text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg font-medium">
                      Preview on Menu: <span className="font-bold">Half ₹{formData.priceHalf || 0} | Full ₹{formData.priceFull || 0}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-surface-700 mb-1">
                      Price (₹) * <span className="text-xs font-normal text-surface-400">(Single Standard Portion)</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      required={!formData.hasPortions}
                      min="0"
                      step="any"
                      value={formData.price}
                      onChange={handleChange}
                      className="input-field font-semibold text-brand-700 text-base bg-white"
                      placeholder="120"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input-field"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-surface-700 mb-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Short description of dish ingredients and taste..."
                />
              </div>
            </div>

            {/* Right column: Image upload + badges */}
            <div className="space-y-4">
              {/* Image Manager */}
              <div className="border border-surface-200 rounded-xl p-3.5 bg-surface-50/70">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-surface-800 flex items-center gap-1.5">
                    <ImageIcon size={16} className="text-brand-600" />
                    Food Photo (डिश की फोटो)
                  </label>
                  <div className="flex bg-surface-200 rounded-lg p-0.5 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setImageTab('upload')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        imageTab === 'upload'
                          ? 'bg-white text-surface-900 shadow-sm font-bold'
                          : 'text-surface-600 hover:text-surface-900'
                      }`}
                    >
                      📱 Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageTab('url')}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        imageTab === 'url'
                          ? 'bg-white text-surface-900 shadow-sm font-bold'
                          : 'text-surface-600 hover:text-surface-900'
                      }`}
                    >
                      Web Link
                    </button>
                  </div>
                </div>

                {imageTab === 'upload' ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="item-image-file-input"
                    />
                    <label
                      htmlFor="item-image-file-input"
                      className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-brand-400 hover:border-brand-600 rounded-xl bg-white cursor-pointer transition-all hover:bg-brand-50/50 text-center shadow-sm"
                    >
                      <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 mb-1.5">
                        <Upload size={18} />
                      </div>
                      <span className="text-sm font-bold text-brand-700">
                        {isProcessingImage ? '⏳ फोटो तैयार हो रही है...' : '📸 फ़ोन गैलरी से फोटो लगाएं'}
                      </span>
                      <span className="text-xs text-surface-500 font-medium mt-0.5">
                        Click to select photo from Phone Gallery / Device
                      </span>
                    </label>
                  </div>
                ) : (
                  <div>
                    <div className="relative">
                      <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
                      <input
                        type="url"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        className="input-field pl-8 text-xs"
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                )}

                {imageError && (
                  <div className="mt-2 text-xs text-red-600 flex items-center gap-1 font-medium">
                    <AlertCircle size={14} /> {imageError}
                  </div>
                )}

                {/* Preview Thumbnail */}
                {imagePreview && (
                  <div className="mt-3">
                    <div className="relative h-28 rounded-xl overflow-hidden border border-surface-200 bg-surface-100 shadow-inner group">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                        onError={() => {
                          setImagePreview(getCategoryFallback(formData.category));
                        }}
                      />
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                        <CheckCircle size={11} className="text-emerald-400" />
                        {formData.image?.startsWith('data:image')
                          ? '✅ Custom Gallery Photo'
                          : formData.image
                          ? '✅ Custom Web Image'
                          : 'Standard Category Photo'}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-surface-100 hover:bg-surface-200 text-surface-800 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        🔄 गैलरी से बदलें
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="py-1.5 px-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
                      >
                        हटाएं
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dietary and Status Toggles */}
              <div className="space-y-2.5 p-3.5 bg-surface-50 rounded-xl border border-surface-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-600 inline-block" /> Pure Vegetarian
                  </span>
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      formData.isVeg ? 'bg-green-600' : 'bg-surface-300'
                    }`}
                    onClick={() => setFormData((p) => ({ ...p, isVeg: !p.isVeg }))}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        formData.isVeg ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
                    🌶️ Spicy
                  </span>
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      formData.isSpicy ? 'bg-red-500' : 'bg-surface-300'
                    }`}
                    onClick={() => setFormData((p) => ({ ...p, isSpicy: !p.isSpicy }))}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        formData.isSpicy ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>

                {formData.isSpicy && (
                  <div className="pl-3 border-l-2 border-red-200">
                    <label className="block text-[11px] font-medium text-surface-500 mb-1">
                      Spice Level (1–3)
                    </label>
                    <input
                      type="range"
                      name="spiceLevel"
                      min="1"
                      max="3"
                      value={formData.spiceLevel || 1}
                      onChange={handleChange}
                      className="w-full accent-red-500"
                    />
                    <div className="flex justify-between text-[10px] text-surface-400">
                      <span>Mild</span>
                      <span>Medium</span>
                      <span>Hot 🔥</span>
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
                    ⭐ Popular / Featured Dish
                  </span>
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      formData.isFeatured ? 'bg-amber-500' : 'bg-surface-300'
                    }`}
                    onClick={() => setFormData((p) => ({ ...p, isFeatured: !p.isFeatured }))}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        formData.isFeatured ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-semibold text-surface-700 flex items-center gap-1.5">
                    ✅ Kitchen Stock Status
                  </span>
                  <div
                    className={`relative w-10 h-5 rounded-full transition-colors ${
                      formData.isAvailable ? 'bg-emerald-600' : 'bg-red-500'
                    }`}
                    onClick={() => setFormData((p) => ({ ...p, isAvailable: !p.isAvailable }))}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                        formData.isAvailable ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Customization groups */}
          <div className="mt-5 border-t border-surface-100 pt-4">
            <h3 className="text-xs font-bold text-surface-700 uppercase tracking-wider mb-2.5">
              Customization Options (Portions, Sizes, Add-ons)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {customizationGroups.map((group) => (
                <label
                  key={group.id}
                  className={`flex items-start gap-2.5 p-2.5 border rounded-xl cursor-pointer transition-colors ${
                    (formData.customizationGroupIds || []).includes(group.id)
                      ? 'border-brand-400 bg-brand-50/70'
                      : 'border-surface-200 hover:bg-surface-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={(formData.customizationGroupIds || []).includes(group.id)}
                    onChange={() => handleCustomizationToggle(group.id)}
                    className="mt-0.5 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-surface-900">{group.name}</div>
                    <div className="text-[11px] text-surface-500">
                      {group.required ? 'Required' : 'Optional'} · {group.options.length} options
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-surface-100">
            <button type="button" onClick={onClose} className="btn-secondary text-sm">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessingImage}
              className="btn-primary text-sm shadow-md"
            >
              {item ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
