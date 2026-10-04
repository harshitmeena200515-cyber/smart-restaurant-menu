import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useMenuStore from '../../store/menuStore';

const ItemForm = ({ item, isOpen, onClose }) => {
  const categories = useMenuStore((s) => s.categories);
  const customizationGroups = useMenuStore((s) => s.customizationGroups);
  const addItem = useMenuStore((s) => s.addItem);
  const updateItem = useMenuStore((s) => s.updateItem);

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: categories[0]?.id || '',
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
      if (item) {
        setFormData({ ...item, price: String(item.price) });
      } else {
        setFormData(emptyForm);
      }
    }
  }, [item, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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
    if (!formData.name || !formData.price) return;

    const data = {
      ...formData,
      price: parseFloat(formData.price),
      spiceLevel: formData.isSpicy ? parseInt(formData.spiceLevel) || 1 : 0,
    };

    if (item) {
      updateItem(item.id, data);
    } else {
      addItem(data);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-8">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-surface-100">
          <h2 className="text-xl font-bold text-surface-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
          <button onClick={onClose} className="p-2 text-surface-400 hover:text-surface-600 rounded-full hover:bg-surface-100">
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Left column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Item Name *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g., Paneer Tikka" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Price (₹) *</label>
                <input type="number" name="price" required min="0" step="1" value={formData.price} onChange={handleChange} className="input-field" placeholder="280" />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange} className="input-field" placeholder="Short description of the dish..." />
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Image URL</label>
                <input type="url" name="image" value={formData.image} onChange={handleChange} className="input-field" placeholder="https://..." />
                {formData.image && (
                  <div className="mt-2 h-28 rounded-xl overflow-hidden border border-surface-200 bg-surface-50">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4 bg-surface-50 rounded-xl border border-surface-100">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-surface-700">Vegetarian</span>
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.isVeg ? 'bg-green-500' : 'bg-surface-300'}`} onClick={() => setFormData((p) => ({ ...p, isVeg: !p.isVeg }))}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${formData.isVeg ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-surface-700">Spicy</span>
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.isSpicy ? 'bg-red-500' : 'bg-surface-300'}`} onClick={() => setFormData((p) => ({ ...p, isSpicy: !p.isSpicy }))}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${formData.isSpicy ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>

                {formData.isSpicy && (
                  <div className="pl-4 border-l-2 border-red-200">
                    <label className="block text-xs font-medium text-surface-500 mb-1">Spice Level (1–3)</label>
                    <input type="range" name="spiceLevel" min="1" max="3" value={formData.spiceLevel || 1} onChange={handleChange} className="w-full accent-red-500" />
                    <div className="flex justify-between text-xs text-surface-400 mt-0.5">
                      <span>Mild</span><span>Medium</span><span>Hot</span>
                    </div>
                  </div>
                )}

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-surface-700">Featured / Popular</span>
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.isFeatured ? 'bg-amber-500' : 'bg-surface-300'}`} onClick={() => setFormData((p) => ({ ...p, isFeatured: !p.isFeatured }))}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${formData.isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-surface-700">Available</span>
                  <div className={`relative w-11 h-6 rounded-full transition-colors ${formData.isAvailable ? 'bg-emerald-500' : 'bg-surface-300'}`} onClick={() => setFormData((p) => ({ ...p, isAvailable: !p.isAvailable }))}>
                    <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Customization groups */}
          <div className="mt-5 border-t border-surface-100 pt-5">
            <h3 className="text-sm font-semibold text-surface-800 mb-3">Customization Groups</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {customizationGroups.map((group) => (
                <label key={group.id} className={`flex items-start gap-2.5 p-3 border rounded-xl cursor-pointer transition-colors ${
                  (formData.customizationGroupIds || []).includes(group.id) ? 'border-brand-400 bg-brand-50' : 'border-surface-200 hover:bg-surface-50'
                }`}>
                  <input
                    type="checkbox"
                    checked={(formData.customizationGroupIds || []).includes(group.id)}
                    onChange={() => handleCustomizationToggle(group.id)}
                    className="mt-0.5 w-4 h-4 text-brand-600 rounded focus:ring-brand-500"
                  />
                  <div>
                    <div className="text-sm font-medium text-surface-900">{group.name}</div>
                    <div className="text-xs text-surface-500">
                      {group.required ? 'Required' : 'Optional'} · {group.options.length} options
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{item ? 'Save Changes' : 'Add Item'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemForm;
