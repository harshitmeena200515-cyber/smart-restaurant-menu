import React, { useState } from 'react';
import { Search, Zap } from 'lucide-react';
import useMenuStore from '../../store/menuStore';

const AvailabilityManager = () => {
  const menuItems = useMenuStore((s) => s.menuItems);
  const categories = useMenuStore((s) => s.categories);
  const toggleAvailability = useMenuStore((s) => s.toggleAvailability);
  const setAvailability = useMenuStore((s) => s.setAvailability);

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = menuItems
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.isAvailable === b.isAvailable) return 0;
      return a.isAvailable ? 1 : -1; // Sold out items first
    });

  const availableCount = filteredItems.filter(i => i.isAvailable).length;
  const soldOutCount = filteredItems.length - availableCount;

  const handleBulkAvailable = () => {
    if (window.confirm(`Mark all ${filteredItems.length} filtered items as AVAILABLE?`)) {
      filteredItems.forEach(item => {
        if (!item.isAvailable) setAvailability(item.id, true);
      });
    }
  };

  const handleBulkSoldOut = () => {
    if (window.confirm(`Mark all ${filteredItems.length} filtered items as SOLD OUT?`)) {
      filteredItems.forEach(item => {
        if (item.isAvailable) setAvailability(item.id, false);
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 flex items-center">
          <Zap className="mr-2 text-brand-500" size={24} />
          Live Availability
        </h2>
        <p className="text-surface-500 text-sm mt-1">One-tap toggle for rush hours. Sold out items appear first.</p>
      </div>

      {/* Category Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            activeCategory === 'all' 
              ? 'bg-brand-600 text-white shadow-sm' 
              : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
          }`}
        >
          All Items
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              activeCategory === cat.id 
                ? 'bg-brand-600 text-white shadow-sm' 
                : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search + Bulk Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={20} />
          <input
            type="text"
            placeholder="Quick search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 text-lg py-3"
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleBulkAvailable}
            className="flex-1 sm:flex-none px-4 py-3 bg-emerald-100 text-emerald-700 font-bold rounded-xl hover:bg-emerald-200 transition-colors text-sm"
          >
            ✅ All Available
          </button>
          <button 
            onClick={handleBulkSoldOut}
            className="flex-1 sm:flex-none px-4 py-3 bg-red-100 text-red-700 font-bold rounded-xl hover:bg-red-200 transition-colors text-sm"
          >
            ❌ All Sold Out
          </button>
        </div>
      </div>

      {/* Status counts */}
      <div className="text-sm font-medium text-surface-500">
        Showing: <span className="text-emerald-600 font-semibold">{availableCount} Available</span> · <span className="text-red-600 font-semibold">{soldOutCount} Sold Out</span>
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredItems.map(item => (
          <div 
            key={item.id} 
            className={`flex items-center p-3 rounded-2xl border-2 transition-all ${
              item.isAvailable 
                ? 'bg-white border-surface-100 shadow-sm' 
                : 'bg-red-50 border-red-200'
            }`}
          >
            <img 
              src={item.image} 
              alt={item.name} 
              className={`w-14 h-14 rounded-xl object-cover mr-3 flex-shrink-0 ${!item.isAvailable ? 'opacity-50 grayscale' : ''}`} 
            />
            
            <div className="flex-1 min-w-0 mr-3">
              <h3 className={`font-bold text-sm truncate ${item.isAvailable ? 'text-surface-900' : 'text-red-800'}`}>
                {item.name}
              </h3>
              <p className={`text-xs font-semibold mt-0.5 ${item.isAvailable ? 'text-emerald-600' : 'text-red-600'}`}>
                {item.isAvailable ? '● Available' : '● Sold Out'}
              </p>
            </div>

            {/* Big toggle switch - easy to tap */}
            <button 
              onClick={() => toggleAvailability(item.id)}
              className={`relative inline-flex h-9 w-16 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2 ${
                item.isAvailable ? 'bg-emerald-500' : 'bg-surface-300'
              }`}
              role="switch"
              aria-checked={item.isAvailable}
              aria-label={`Toggle ${item.name} availability`}
            >
              <span
                className={`pointer-events-none absolute h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${
                  item.isAvailable ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="py-12 text-center text-surface-500 bg-white rounded-2xl border border-surface-200">
          No items match your filter.
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;
