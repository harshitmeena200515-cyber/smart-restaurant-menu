import React, { useState } from 'react';
import { X, Flame, Sparkles, Check, Info } from 'lucide-react';
import useMenuStore from '../../store/menuStore';
import { getProductImageUrl, getCategoryFallback } from '../../utils/imageUtils';

export const ItemDetailModal = ({ item, isOpen, onClose }) => {
  const getCustomizationGroupsForItem = useMenuStore((state) => state.getCustomizationGroupsForItem);
  const [imageError, setImageError] = useState(false);

  if (!isOpen || !item) return null;

  const groups = getCustomizationGroupsForItem(item.id) || [];
  const displayImage = getProductImageUrl(item.image, item.category, item.id, item.name);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl border border-stone-200/90 text-left relative">
        {/* Header Media */}
        <div className="relative aspect-[16/9] w-full bg-stone-950 flex-shrink-0 overflow-hidden">
          {!imageError ? (
            <img
              src={displayImage}
              alt={item.name}
              className="w-full h-full object-cover brightness-[0.92] contrast-[1.05]"
              onError={() => setImageError(true)}
            />
          ) : (
            <img
              src={getCategoryFallback(item.category)}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          )}

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-black/20 to-black/40 pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-black/80 backdrop-blur-md rounded-full text-white transition-all shadow-lg border border-white/20 active:scale-95"
            aria-label="Close details"
          >
            <X size={18} />
          </button>

          {/* Floating Diet badge over image */}
          <div className="absolute bottom-4 left-5 flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg bg-white/95 backdrop-blur-md flex items-center justify-center border-2 ${
                item.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <span
                className={`w-2 h-2 ${item.isVeg ? 'bg-emerald-600 rounded-full' : 'bg-rose-600'}`}
                style={!item.isVeg ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } : {}}
              />
            </span>
            <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-bold border border-white/20">
              {item.isVeg ? 'Pure Vegetarian' : 'Non-Vegetarian'}
            </span>
            {item.isSpicy && (
              <span className="px-3 py-1 rounded-full bg-red-950/80 backdrop-blur-md text-red-200 text-xs font-bold border border-red-500/40 flex items-center gap-1">
                <Flame size={12} className="text-red-400" />
                <span>Spicy Level {item.spiceLevel || 1}</span>
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="overflow-y-auto flex-grow p-5 sm:p-7 space-y-6">
          {/* Title & Category */}
          <div className="space-y-2 pb-4 border-b border-stone-100">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 leading-tight">
                  {item.name}
                </h2>
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-widest block mt-0.5">
                  {item.category?.toUpperCase()} · CHULHA KITCHEN
                </span>
              </div>
              {!item.hasPortions && (
                <div className="text-right shrink-0">
                  <span className="text-2xl sm:text-3xl font-serif font-black text-orange-700 tabular-nums">
                    ₹{item.price}
                  </span>
                  <span className="block text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                    Standard Portion
                  </span>
                </div>
              )}
            </div>

            <p className="text-sm text-stone-600 leading-relaxed font-normal">
              {item.description}
            </p>
          </div>

          {/* Sold out notice if unavailable */}
          {!item.isAvailable && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-bold text-center">
              This item is currently sold out in the kitchen for today's service.
            </div>
          )}

          {/* Portion Options Breakdown Banner */}
          {item.hasPortions ? (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/90 rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  Portion Sizes &amp; Pricing
                </span>
                <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Available in 2 Portions
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-amber-200/80 shadow-2xs text-center">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Half Portion</span>
                  <span className="font-serif font-black text-2xl text-amber-900 tabular-nums mt-0.5 block">
                    ₹{item.priceHalf}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-1">Individual Serving</span>
                </div>
                <div className="bg-white p-4 rounded-xl border border-orange-200/80 shadow-2xs text-center">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">Full Portion</span>
                  <span className="font-serif font-black text-2xl text-orange-700 tabular-nums mt-0.5 block">
                    ₹{item.priceFull}
                  </span>
                  <span className="text-[10px] text-stone-400 block mt-1">Full Family Serving</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">Standard Portion</span>
                <span className="text-xs text-stone-400">Fixed dish serving</span>
              </div>
              <span className="font-serif font-black text-2xl text-orange-700 tabular-nums">
                ₹{item.price}
              </span>
            </div>
          )}

          {/* Informational Culinary Add-ons/Varieties if available */}
          {groups.length > 0 && (
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                <Info size={14} />
                Available Culinary Variations &amp; Styles
              </h3>
              <div className="space-y-3">
                {groups.map((group) => (
                  <div key={group.id} className="p-3.5 rounded-2xl bg-stone-50/80 border border-stone-200/80 space-y-2">
                    <span className="text-xs font-bold text-stone-800 block">{group.name}</span>
                    <div className="flex flex-wrap gap-2">
                      {group.options?.map((opt, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-xs font-semibold text-stone-700 flex items-center gap-1.5 shadow-2xs"
                        >
                          <span>{opt.name}</span>
                          {opt.price > 0 && (
                            <span className="text-[10px] text-orange-700 font-bold">(+₹{opt.price})</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Dismiss Button */}
        <div className="p-4 sm:p-5 bg-white border-t border-stone-200/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 active:bg-stone-950 text-white font-bold text-sm transition-all shadow-md active:scale-95 text-center"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
