import React, { useState, useEffect, useRef } from 'react';
import { Eye, AlertCircle, Sparkles, Flame, Check } from 'lucide-react';
import { getProductImageUrl, getCategoryFallback } from '../../utils/imageUtils';

export const MenuCard = ({ item, onOpenDetail }) => {
  const [imgSrc, setImgSrc] = useState(() =>
    getProductImageUrl(item?.image, item?.category, item?.id, item?.name)
  );
  const [hasFailed, setHasFailed] = useState(false);
  const cardRef = useRef(null);

  // 3D Tilt & Specular Glare State
  const [tilt, setTilt] = useState({
    rotateX: 0,
    rotateY: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);
  }, []);

  useEffect(() => {
    setImgSrc(getProductImageUrl(item?.image, item?.category, item?.id, item?.name));
    setHasFailed(false);
  }, [item?.image, item?.category, item?.id, item?.name]);

  if (!item) return null;

  const handleImageError = () => {
    const fallback = getCategoryFallback(item.category);
    if (imgSrc !== fallback) {
      setImgSrc(fallback);
    } else {
      setHasFailed(true);
    }
  };

  // Interactive 3D Spatial Tilt Handlers
  const handleMouseMove = (e) => {
    if (!item.isAvailable || prefersReducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 7;
    const rotateX = -((y - centerY) / centerY) * 7;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY, isHovered: true });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, isHovered: false });
  };

  const hasCustomizations = item.customizationGroupIds && item.customizationGroupIds.length > 0;

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => item.isAvailable && onOpenDetail(item)}
      className="relative select-none text-left h-full flex flex-col group"
      style={{ perspective: '1000px' }}
    >
      <div
        className={`relative flex flex-col h-full rounded-[1.75rem] overflow-hidden bg-white border transition-all duration-300 ${
          item.isAvailable
            ? 'cursor-pointer border-stone-200/90 shadow-sm hover:shadow-2xl hover:border-orange-300/80'
            : 'border-stone-200/50 bg-stone-50/90 opacity-70 cursor-not-allowed'
        }`}
        style={
          tilt.isHovered && item.isAvailable && !prefersReducedMotion
            ? {
                transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
                transformStyle: 'preserve-3d',
                boxShadow:
                  '0 24px 38px -12px rgba(0, 0, 0, 0.14), 0 0 24px rgba(234, 88, 12, 0.08)',
              }
            : { transformStyle: 'preserve-3d' }
        }
      >
        {/* Specular Sheen Reflection Overlay */}
        {tilt.isHovered && item.isAvailable && !prefersReducedMotion && (
          <div
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300 rounded-[1.75rem]"
            style={{
              background: `radial-gradient(circle 220px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.28), transparent 75%)`,
            }}
          />
        )}

        {/* Floating Food Photography Section */}
        <div
          className="relative aspect-[16/11] w-full bg-stone-100 overflow-hidden shrink-0"
          style={tilt.isHovered ? { transform: 'translateZ(16px)' } : {}}
        >
          {!hasFailed && imgSrc ? (
            <img
              src={imgSrc}
              alt={item.name}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                item.isAvailable ? 'group-hover:scale-108' : 'grayscale contrast-75'
              }`}
              onError={handleImageError}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-stone-100 to-amber-50 flex flex-col items-center justify-center p-4 text-center">
              <span className="text-4xl mb-1.5">🥘</span>
              <span className="text-stone-700 text-xs font-semibold">{item.name}</span>
            </div>
          )}

          {/* Vignette Bottom Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

          {/* Luxury Veg / Non-Veg Indicator Icon */}
          <div
            className="absolute top-3 left-3 p-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-black/5"
            style={tilt.isHovered ? { transform: 'translateZ(26px)' } : {}}
          >
            <div
              className={`w-4 h-4 border-2 flex items-center justify-center rounded-sm ${
                item.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
            >
              <div
                className={`w-2 h-2 ${
                  item.isVeg ? 'bg-emerald-600 rounded-full' : 'bg-rose-600'
                }`}
                style={!item.isVeg ? { clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' } : {}}
              />
            </div>
          </div>

          {/* Chef's Signature Badge */}
          {item.isFeatured && item.isAvailable && (
            <div
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-stone-900/95 backdrop-blur-md text-amber-300 border border-amber-500/40 text-[10px] font-extrabold tracking-wider flex items-center gap-1.5 shadow-lg"
              style={tilt.isHovered ? { transform: 'translateZ(30px)' } : {}}
            >
              <Sparkles size={11} className="text-amber-400" />
              <span>Chef's Choice</span>
            </div>
          )}

          {/* Category Pill Over Image */}
          <div
            className="absolute bottom-2.5 left-3 px-2.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-stone-200 text-[10px] font-semibold tracking-wide border border-white/10"
            style={tilt.isHovered ? { transform: 'translateZ(20px)' } : {}}
          >
            {item.category?.toUpperCase()}
          </div>

          {/* Sold Out Full Overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-stone-950/85 backdrop-blur-[3px] flex flex-col items-center justify-center p-4 text-center z-20">
              <div className="px-4 py-1.5 rounded-full bg-rose-600/90 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg flex items-center gap-1.5 border border-rose-400/30">
                <AlertCircle size={14} />
                <span>Sold Out Today</span>
              </div>
              <span className="text-[11px] text-stone-300 mt-1.5 font-medium max-w-[180px]">
                Fresh ingredients restocked tomorrow
              </span>
            </div>
          )}
        </div>

        {/* Content Area with Depth */}
        <div
          className="p-4 sm:p-5 flex flex-col flex-grow justify-between"
          style={tilt.isHovered ? { transform: 'translateZ(14px)' } : {}}
        >
          <div>
            {/* Title & Spice note */}
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-serif font-black text-base sm:text-lg text-stone-900 group-hover:text-orange-600 transition-colors leading-snug line-clamp-1">
                {item.name}
              </h3>
              {item.isSpicy && (
                <span
                  className="text-xs text-red-600 font-bold shrink-0 mt-0.5 flex items-center"
                  title={`Spice Level: ${item.spiceLevel || 1}`}
                >
                  {'🌶️'.repeat(Math.min(item.spiceLevel || 1, 3))}
                </span>
              )}
            </div>

            {/* Appetizing Culinary Description */}
            <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed font-normal mb-3">
              {item.description}
            </p>
          </div>

          {/* Bottom Strip: Price & Menu Details */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 mt-auto">
            <div className="flex-1 min-w-0">
              {item.hasPortions && (item.priceHalf != null || item.priceFull != null) ? (
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-baseline gap-1 text-xs font-bold text-stone-800 bg-amber-50/90 border border-amber-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Half</span>
                      <span className="font-serif font-black text-sm sm:text-base text-amber-900 tabular-nums">₹{item.priceHalf ?? Math.round(item.price * 0.6)}</span>
                    </span>
                    <span className="text-stone-300 font-bold text-xs">|</span>
                    <span className="inline-flex items-baseline gap-1 text-xs font-bold text-stone-800 bg-orange-50/90 border border-orange-200/80 px-2 py-0.5 rounded-lg shadow-2xs">
                      <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Full</span>
                      <span className="font-serif font-black text-sm sm:text-base text-orange-700 tabular-nums">₹{item.priceFull ?? item.price}</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-medium block mt-1">
                    Half &amp; Full portions available
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-serif font-black text-xl sm:text-2xl text-orange-700 tracking-tight tabular-nums">
                      ₹{item.price}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">Standard</span>
                  </div>
                  <span className="text-[10px] text-stone-400 block mt-0.5">
                    Full Portion
                  </span>
                </div>
              )}
            </div>

            {/* Menu Information CTA */}
            {item.isAvailable ? (
              <button
                type="button"
                className="px-3 py-1.5 rounded-xl bg-stone-50 hover:bg-orange-50 active:bg-orange-100 text-stone-700 hover:text-orange-700 font-bold text-xs transition-all duration-200 flex items-center gap-1.5 border border-stone-200/80 hover:border-orange-300 shadow-2xs active:scale-95 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetail(item);
                }}
                aria-label={`View details for ${item.name}`}
              >
                <Eye size={13} className="text-stone-400 group-hover:text-orange-600 transition-colors" />
                <span>Details</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-stone-400 px-2.5 py-1 rounded-xl bg-stone-100 border border-stone-200/60 shrink-0">
                Sold Out
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
