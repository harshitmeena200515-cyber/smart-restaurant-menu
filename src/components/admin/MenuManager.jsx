import React, { useState, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, Star, Filter, Camera } from 'lucide-react';
import useMenuStore from '../../store/menuStore';
import ItemForm from './ItemForm';
import { getProductImageUrl, getCategoryFallback, processUploadedImage } from '../../utils/imageUtils';

const MenuManager = () => {
  const menuItems = useMenuStore((s) => s.menuItems);
  const categories = useMenuStore((s) => s.categories);
  const toggleAvailability = useMenuStore((s) => s.toggleAvailability);
  const toggleFeatured = useMenuStore((s) => s.toggleFeatured);
  const deleteItem = useMenuStore((s) => s.deleteItem);
  const setAvailability = useMenuStore((s) => s.setAvailability);
  const updateItem = useMenuStore((s) => s.updateItem);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAvailability, setFilterAvailability] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [quickUploadItemId, setQuickUploadItemId] = useState(null);
  const quickFileInputRef = useRef(null);

  const handleQuickGalleryUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !quickUploadItemId) return;
    try {
      const dataUrl = await processUploadedImage(file, 900, 700, 0.85);
      updateItem(quickUploadItemId, { image: dataUrl });
    } catch (err) {
      alert(err.message || 'Failed to upload photo from gallery');
    } finally {
      setQuickUploadItemId(null);
      if (quickFileInputRef.current) quickFileInputRef.current.value = '';
    }
  };

  const triggerGalleryPicker = (itemId) => {
    setQuickUploadItemId(itemId);
    quickFileInputRef.current?.click();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsFormOpen(true);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      deleteItem(id);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesAvailability = filterAvailability === 'all' 
      || (filterAvailability === 'available' && item.isAvailable)
      || (filterAvailability === 'soldout' && !item.isAvailable);
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  const handleBulkAvailable = () => {
    if (window.confirm(`Mark ${filteredItems.length} items as available?`)) {
      filteredItems.forEach(item => { if (!item.isAvailable) setAvailability(item.id, true); });
    }
  };

  const handleBulkSoldOut = () => {
    if (window.confirm(`Mark ${filteredItems.length} items as sold out?`)) {
      filteredItems.forEach(item => { if (item.isAvailable) setAvailability(item.id, false); });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-surface-900">Menu Items</h2>
        <button 
          onClick={handleAddNew}
          className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-surface-100 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={18} />
          <input
            type="text" placeholder="Search items..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex gap-3">
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field w-full md:w-auto">
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)}
            className="input-field w-full md:w-auto">
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="soldout">Sold Out</option>
          </select>
        </div>
      </div>

      {/* Bulk actions */}
      {filteredItems.length > 0 && (
        <div className="flex gap-2">
          <button onClick={handleBulkAvailable} className="px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 font-medium">
            Mark Filtered Available
          </button>
          <button onClick={handleBulkSoldOut} className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium">
            Mark Filtered Sold Out
          </button>
          <span className="text-sm text-surface-400 self-center ml-2">{filteredItems.length} items</span>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-surface-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-50 border-b border-surface-100">
              <th className="p-4 font-semibold text-surface-500 text-sm">Item</th>
              <th className="p-4 font-semibold text-surface-500 text-sm">Category</th>
              <th className="p-4 font-semibold text-surface-500 text-sm">Price</th>
              <th className="p-4 font-semibold text-surface-500 text-sm">Status</th>
              <th className="p-4 font-semibold text-surface-500 text-sm text-center">Featured</th>
              <th className="p-4 font-semibold text-surface-500 text-sm text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-surface-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="relative group cursor-pointer shrink-0"
                      onClick={() => triggerGalleryPicker(item.id)}
                      title="फ़ोन गैलरी से फोटो बदलें (Click to choose photo from gallery)"
                    >
                      <img 
                        src={getProductImageUrl(item.image, item.category, item.id, item.name)} 
                        alt={item.name} 
                        className="w-12 h-12 rounded-lg object-cover bg-surface-100 border border-surface-200"
                        onError={(e) => {
                          e.target.src = getCategoryFallback(item.category);
                        }} 
                      />
                      <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                        📷 गैलरी
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 border rounded-sm flex-shrink-0 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <span className={`block w-1.5 h-1.5 m-auto mt-[2px] ${item.isVeg ? 'bg-green-600 rounded-full' : 'bg-red-600'}`}
                          style={!item.isVeg ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } : {}} />
                      </span>
                      <span className="font-medium text-surface-900">{item.name}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-surface-600 text-sm">
                  {categories.find(c => c.id === item.category)?.name}
                </td>
                <td className="p-4 font-semibold">₹{item.price}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleAvailability(item.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.isAvailable ? 'bg-emerald-500' : 'bg-surface-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-xs font-semibold ${item.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                      {item.isAvailable ? 'Available' : 'Sold Out'}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => toggleFeatured(item.id)} className="hover:scale-110 transition-transform">
                    <Star size={20} className={item.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-surface-300'} />
                  </button>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-1.5 items-center">
                    <button
                      onClick={() => triggerGalleryPicker(item.id)}
                      className="px-2 py-1.5 text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors font-semibold flex items-center gap-1"
                      title="फ़ोन गैलरी से फोटो लगाएं"
                    >
                      <Camera size={14} />
                      <span>फोटो</span>
                    </button>
                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id, item.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr><td colSpan="6" className="p-8 text-center text-surface-500">No items found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-surface-100">
            <div className="flex gap-3 mb-3">
              <div
                className="relative shrink-0 cursor-pointer"
                onClick={() => triggerGalleryPicker(item.id)}
                title="गैलरी से फोटो लगाएं"
              >
                <img 
                  src={getProductImageUrl(item.image, item.category, item.id, item.name)} 
                  alt={item.name} 
                  className="w-16 h-16 rounded-xl object-cover bg-surface-100 border border-surface-200"
                  onError={(e) => {
                    e.target.src = getCategoryFallback(item.category);
                  }} 
                />
                <span className="absolute -bottom-1 -right-1 bg-brand-600 text-white p-1 rounded-full shadow text-[10px] leading-none">
                  📷
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className={`inline-block w-3 h-3 border rounded-sm flex-shrink-0 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                      <span className={`block w-1.5 h-1.5 m-auto mt-[2px] ${item.isVeg ? 'bg-green-600 rounded-full' : 'bg-red-600'}`}
                        style={!item.isVeg ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } : {}} />
                    </span>
                    <span className="font-semibold text-surface-900 truncate">{item.name}</span>
                  </div>
                  <span className="font-semibold shrink-0 ml-2">₹{item.price}</span>
                </div>
                <p className="text-xs text-surface-500 mt-0.5">{categories.find(c => c.id === item.category)?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-surface-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => toggleAvailability(item.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${item.isAvailable ? 'bg-emerald-500' : 'bg-surface-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${item.isAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className={`text-xs font-semibold ${item.isAvailable ? 'text-emerald-600' : 'text-red-500'}`}>
                    {item.isAvailable ? 'Avail' : 'Out'}
                  </span>
                </div>
                <button onClick={() => toggleFeatured(item.id)}>
                  <Star size={18} className={item.isFeatured ? 'fill-amber-400 text-amber-400' : 'text-surface-300'} />
                </button>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => triggerGalleryPicker(item.id)}
                  className="px-2.5 py-1.5 text-xs text-brand-700 bg-brand-50 rounded-lg font-semibold flex items-center gap-1 border border-brand-200"
                  title="फ़ोन गैलरी से फोटो लगाएं"
                >
                  <Camera size={13} />
                  <span>फोटो</span>
                </button>
                <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 bg-blue-50 rounded-lg" title="Edit">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(item.id, item.name)} className="p-1.5 text-red-500 bg-red-50 rounded-lg" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="p-8 text-center text-surface-500 bg-white rounded-xl border border-surface-100">No items found.</div>
        )}
      </div>

      {/* Hidden file input for quick phone gallery photo update */}
      <input
        ref={quickFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleQuickGalleryUpload}
        className="hidden"
      />

      <ItemForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} item={editingItem} />
    </div>
  );
};

export default MenuManager;
