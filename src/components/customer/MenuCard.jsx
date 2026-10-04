import React, { useState } from 'react';

const MenuCard = ({ item, onOpenDetail }) => {
  const [imageError, setImageError] = useState(false);

  if (!item) return null;

  return (
    <div 
      className={`card flex flex-col rounded-xl overflow-hidden bg-white shadow-sm border border-surface-200 transition-all ${
        item.isAvailable ? 'cursor-pointer hover:shadow-md' : 'opacity-70 pointer-events-none'
      }`}
      onClick={() => item.isAvailable && onOpenDetail(item)}
    >
      <div className="relative aspect-[3/2] w-full bg-surface-100 overflow-hidden">
        {!imageError && item.image ? (
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-300 flex items-center justify-center">
            <span className="text-brand-500 font-medium">No Image</span>
          </div>
        )}
        
        {item.isFeatured && (
          <div className="absolute top-2 right-2 badge-featured bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
            ⭐ Featured
          </div>
        )}

        {!item.isAvailable && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
            <span className="badge-soldout bg-surface-800 text-white font-bold px-4 py-2 rounded-lg text-lg uppercase tracking-wider shadow-lg transform -rotate-6">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <div className={`badge-${item.isVeg ? 'veg' : 'nonveg'} flex-shrink-0 flex items-center justify-center w-4 h-4 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} rounded-sm`}>
              <div className={`w-2 h-2 ${item.isVeg ? 'bg-green-600 rounded-full' : 'bg-red-600'}`} style={!item.isVeg ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } : {}}></div>
            </div>
            <h3 className="font-semibold text-base text-surface-900 line-clamp-1">{item.name}</h3>
          </div>
          {item.isSpicy && (
            <span className="badge-spicy text-sm" title="Spicy">🌶️</span>
          )}
        </div>
        
        <p className="text-sm text-surface-500 line-clamp-2 mb-3 flex-grow">
          {item.description}
        </p>
        
        <div className="mt-auto">
          <span className="font-bold text-brand-600">₹{item.price}</span>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
