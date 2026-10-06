import React, { useState, useEffect } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import useMenuStore from '../../store/menuStore';
import useCartStore from '../../store/cartStore';
import { getProductImageUrl, getCategoryFallback } from '../../utils/imageUtils';

const ItemDetailModal = ({ item, isOpen, onClose }) => {
  const getCustomizationGroupsForItem = useMenuStore(state => state.getCustomizationGroupsForItem);
  const addToCart = useCartStore(state => state.addToCart);

  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(1);
      const groups = getCustomizationGroupsForItem(item.id) || [];
      const initialSelections = {};
      
      groups.forEach(group => {
        if (group.required && group.maxSelect === 1 && group.options?.length > 0) {
          initialSelections[group.id] = [group.options[0]];
        } else {
          initialSelections[group.id] = [];
        }
      });
      
      setSelectedCustomizations(initialSelections);
      setImageError(false);
    }
  }, [isOpen, item, getCustomizationGroupsForItem]);

  if (!isOpen || !item) return null;

  const groups = getCustomizationGroupsForItem(item.id) || [];

  const handleOptionToggle = (group, option) => {
    setSelectedCustomizations(prev => {
      const currentSelections = prev[group.id] || [];
      const isSelected = currentSelections.some(opt => opt.name === option.name);

      if (group.maxSelect === 1) {
        return { ...prev, [group.id]: [option] };
      }

      if (isSelected) {
        return {
          ...prev,
          [group.id]: currentSelections.filter(opt => opt.name !== option.name)
        };
      } else {
        if (currentSelections.length < group.maxSelect) {
          return {
            ...prev,
            [group.id]: [...currentSelections, option]
          };
        }
        return prev;
      }
    });
  };

  const calculateTotal = () => {
    let total = item.price;
    Object.values(selectedCustomizations).forEach(options => {
      options.forEach(opt => {
        total += opt.price || 0;
      });
    });
    return total * quantity;
  };

  const isFormValid = () => {
    return groups.every(group => {
      if (group.required) {
        const selections = selectedCustomizations[group.id] || [];
        return selections.length > 0;
      }
      return true;
    });
  };

  const handleAddToCart = () => {
    if (!isFormValid()) return;

    const flattenedCustomizations = [];
    Object.entries(selectedCustomizations).forEach(([groupId, options]) => {
      const group = groups.find(g => g.id === groupId);
      options.forEach(opt => {
        flattenedCustomizations.push({
          groupName: group.name,
          optionName: opt.name,
          price: opt.price || 0
        });
      });
    });

    addToCart({
      menuItem: item,
      quantity,
      selectedCustomizations: flattenedCustomizations,
      itemTotal: calculateTotal() / quantity,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="relative aspect-video w-full bg-surface-100 flex-shrink-0">
          {!imageError ? (
            <img 
              src={getProductImageUrl(item.image, item.category)} 
              alt={item.name} 
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <img
              src={getCategoryFallback(item.category)}
              alt={item.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/80 hover:bg-white backdrop-blur rounded-full text-surface-900 transition-colors shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-grow scrollbar-hide pb-24">
          <div className="p-5">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`flex-shrink-0 flex items-center justify-center w-4 h-4 border ${item.isVeg ? 'border-green-600' : 'border-red-600'} rounded-sm`}>
                    <div className={`w-2 h-2 ${item.isVeg ? 'bg-green-600 rounded-full' : 'bg-red-600'}`} style={!item.isVeg ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } : {}}></div>
                  </div>
                  <h2 className="text-xl font-bold text-surface-900">{item.name}</h2>
                </div>
                {item.isSpicy && <span className="text-sm">🌶️ Spicy</span>}
              </div>
              <div className="text-xl font-bold text-brand-600 shrink-0">
                ₹{item.price}
              </div>
            </div>
            
            <p className="text-surface-600 text-sm">{item.description}</p>

            {!item.isAvailable && (
              <div className="mt-4 bg-red-50 text-red-600 p-4 rounded-xl text-center font-semibold">
                Currently Unavailable
              </div>
            )}

            {item.isAvailable && groups.length > 0 && (
              <div className="mt-6 space-y-6">
                {groups.map(group => {
                  const selections = selectedCustomizations[group.id] || [];
                  return (
                    <div key={group.id}>
                      <div className="flex items-baseline justify-between mb-3">
                        <h3 className="font-semibold text-surface-900">{group.name}</h3>
                        <span className="text-xs font-medium text-surface-500">
                          {group.required ? 'Required' : 'Optional'} 
                          {group.maxSelect > 1 ? ` (Max ${group.maxSelect})` : ''}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {group.options?.map((option, idx) => {
                          const isSelected = selections.some(opt => opt.name === option.name);
                          const isDisabled = !isSelected && selections.length >= group.maxSelect;
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => handleOptionToggle(group, option)}
                              disabled={isDisabled}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${
                                isSelected 
                                  ? 'bg-brand-500 border-brand-500 text-white' 
                                  : isDisabled
                                    ? 'bg-surface-50 border-surface-100 text-surface-400 cursor-not-allowed'
                                    : 'bg-surface-100 border-surface-100 text-surface-700 hover:bg-surface-200'
                              }`}
                            >
                              {option.name}
                              {option.price > 0 && <span className={`ml-1 ${isSelected ? 'text-brand-100' : 'text-surface-500'}`}>+₹{option.price}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {item.isAvailable && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-surface-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4">
            <div className="flex items-center bg-surface-100 rounded-full p-1">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-surface-700 shadow-sm disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-semibold text-surface-900">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-surface-700 shadow-sm"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!isFormValid()}
              className="flex-1 bg-brand-500 hover:bg-brand-600 disabled:bg-surface-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-full font-bold transition-colors flex justify-between items-center"
            >
              <span>Add to Cart</span>
              <span>₹{calculateTotal()}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemDetailModal;
