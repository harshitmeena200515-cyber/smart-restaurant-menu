import React, { useState } from 'react';
import { Sparkles, Utensils, Flame, Leaf, Clock, ArrowDown, Info, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import useMenuStore from '../../store/menuStore';
import imgHaraBhara from '../../assets/images/hara-bhara-kebab.jpg';
import imgTandooriRoti from '../../assets/images/tandoori-roti.jpg';

// Signature dishes highlighted in the featured showcase
const SIGNATURE_DISHES = [
  {
    id: 'chulha-special',
    menuItemId: 'item-008',
    name: 'Slow-Cooked Dal Makhani',
    hindi: 'धीमी आंच की दाल मखनी',
    desc: 'Simmered overnight on traditional earthen chulha coals with cultured white butter & farm cream.',
    tag: '14h Chulha Simmer',
    price: 260,
    portionText: 'Half ₹150 | Full ₹260',
    accentColor: '#b45309',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&h=600&fit=crop',
    cookingNote: 'Clay Handi Simmer · Cultured A2 Butter',
    spiceTag: 'Mild & Creamy',
    isVeg: true,
  },
  {
    id: 'tandoor-special',
    menuItemId: 'item-001',
    name: 'Tandoori Paneer Tikka',
    hindi: 'अंगारे पर भुना पनीर टिक्का',
    desc: 'Artisanal organic cottage cheese marinated in stone-ground spices and fired in clay tandoor.',
    tag: 'Clay Kiln Char',
    price: 280,
    portionText: 'Half ₹160 | Full ₹280',
    accentColor: '#c2410c',
    image: imgHaraBhara,
    cookingNote: 'Sal Wood Charcoal · Mint Chutney',
    spiceTag: 'Medium Spiced',
    isVeg: true,
  },
  {
    id: 'farm-breads',
    menuItemId: 'item-016',
    name: 'Crisp Tandoori Roti & Naan',
    hindi: 'खेत के गेहूं की तंदूरी रोटी',
    desc: 'Whole wheat harvested from local fields, hand-stretched and slapped on blazing clay kiln walls.',
    tag: 'Farm Wheat Harvest',
    price: 35,
    portionText: '₹35 Standard',
    accentColor: '#d97706',
    image: imgTandooriRoti,
    cookingNote: 'Charred Blister Crust · Glazed with Desi Ghee',
    spiceTag: 'Warm & Flaky',
    isVeg: true,
  },
  {
    id: 'biryani-special',
    menuItemId: 'item-014',
    name: 'Clay Pot Dum Biryani',
    hindi: 'हांडी दम बिरयानी',
    desc: 'Fragrant long-grain basmati sealed in dough, layered with saffron, caramelised onions & farm mint.',
    tag: 'Dough-Sealed Dum',
    price: 280,
    portionText: 'Half ₹160 | Full ₹280',
    accentColor: '#ea580c',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&h=600&fit=crop',
    cookingNote: 'Sealed Handi · Saffron & Crispy Birista',
    spiceTag: 'Aromatic Spices',
    isVeg: true,
  },
];

export const Culinary3DHero = ({
  restaurant,
  tableNumber,
  onExploreClick,
  onOpenDishDetail,
}) => {
  const menuItems = useMenuStore((s) => s.menuItems);
  const [activeDishIndex, setActiveDishIndex] = useState(0);

  const currentDish = SIGNATURE_DISHES[activeDishIndex];
  const liveMatch = menuItems?.find((i) => i.id === currentDish.menuItemId);
  const livePortionText = liveMatch
    ? liveMatch.hasPortions && (liveMatch.priceHalf != null || liveMatch.priceFull != null)
      ? `Half ₹${liveMatch.priceHalf ?? Math.round(liveMatch.price * 0.6)} | Full ₹${liveMatch.priceFull ?? liveMatch.price}`
      : `₹${liveMatch.price}`
    : currentDish.portionText || `₹${currentDish.price}`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white pt-5 pb-12 sm:pt-8 sm:pb-16 rounded-b-[2.5rem] shadow-2xl border-b border-stone-800">
      {/* Dynamic Warm Hearth Atmosphere Lighting */}
      <div className="absolute top-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-b from-orange-600/25 via-amber-600/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header / Table Brand Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 sm:mb-8 pb-4 border-b border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/30 border border-amber-500/30 flex items-center justify-center shadow-inner overflow-hidden shrink-0">
              {restaurant.logo && (restaurant.logo.startsWith('http') || restaurant.logo.startsWith('data:') || restaurant.logo.startsWith('/')) ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif font-black text-amber-300 text-base select-none">
                  {restaurant.name ? restaurant.name.charAt(0).toUpperCase() : 'M'}
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-base sm:text-lg tracking-wide text-white">
                  {restaurant.name}
                </span>
                {restaurant.subname && (
                  <span className="text-[10px] font-sans font-bold tracking-wide px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {restaurant.subname}
                  </span>
                )}
              </div>
              <p className="text-stone-400 font-medium text-[11px] sm:text-xs">
                {restaurant.tagline || 'Farm Fresh · Organic · Rural Dining'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {tableNumber ? (
              <div className="px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/50 text-orange-300 font-bold text-xs flex items-center gap-2 shadow-sm animate-pulse">
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>Table {tableNumber} Seated</span>
              </div>
            ) : (
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-stone-300 font-medium text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Live Hearth Kitchen</span>
              </div>
            )}

            <Link
              to="/about"
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white font-semibold flex items-center gap-1.5 text-xs border border-white/15 shadow-xs"
            >
              <Info size={13} className="text-amber-300" />
              <span>Farm Photos & Story</span>
            </Link>
          </div>
        </div>

        {/* 2-Column Hero: Story & Credentials Left, Featured Dish Showcase Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Brand Story & Live Badges */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-300 text-xs font-semibold shadow-xs">
              <Flame size={14} className="text-orange-400 animate-pulse" />
              <span>Wood-Fired Hearth Simmered Overnight</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-black tracking-tight text-white leading-[1.12]">
              Real Earthen Flavors, <br />
              <span className="italic font-normal text-amber-400">Slow-Cooked</span> in Clay Pots.
            </h1>

            <p className="text-sm sm:text-base text-stone-300 font-normal leading-relaxed max-w-xl">
              Harvested daily from our Bikaipur farm fields, stone-pounded with cold-pressed mustard oil, and simmered slowly over wood-fired chulha coals. Browse our authentic dining menu.
            </p>

            {/* Culinary Credentials Ribbon */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-left border-t border-white/10 max-w-lg">
              <div className="space-y-0.5">
                <span className="text-[11px] text-stone-400 font-medium block">Cooking Hearth</span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                  <Flame size={13} className="text-amber-400 shrink-0" /> Sal Wood Coals
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-stone-400 font-medium block">Ingredients</span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                  <Leaf size={13} className="text-emerald-400 shrink-0" /> 100% Farm Fresh
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] text-stone-400 font-medium block">Service Time</span>
                <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1">
                  <Clock size={13} className="text-blue-400 shrink-0" /> Fresh to Table
                </span>
              </div>
            </div>

            {/* Explore Menu Button */}
            <div className="pt-2">
              <button
                onClick={onExploreClick}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:from-orange-700 active:to-amber-700 text-white font-bold text-sm transition-all duration-200 shadow-xl shadow-orange-600/30 flex items-center gap-2.5 hover:translate-y-[-1px]"
              >
                <Utensils size={16} />
                <span>Explore Full Menu</span>
                <ArrowDown size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Premium Featured Food Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            {/* Featured Dish Card */}
            <div className="w-full max-w-[460px] bg-stone-900/90 rounded-[2rem] border border-amber-500/25 p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-4">
              {/* Dish Image Container with Badges */}
              <div
                className="relative aspect-[16/11] w-full rounded-2xl overflow-hidden bg-stone-950 shadow-inner cursor-pointer group"
                onClick={() => onOpenDishDetail && onOpenDishDetail(currentDish.menuItemId)}
              >
                <img
                  src={currentDish.image}
                  alt={currentDish.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-[0.92] contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-extrabold text-amber-300 border border-amber-500/40 shadow-sm flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-400" />
                    <span>{currentDish.tag}</span>
                  </span>

                  <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white font-bold text-xs border border-white/15 tabular-nums">
                    {livePortionText}
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 inset-x-3 text-left">
                  <h3 className="font-serif font-black text-lg sm:text-xl text-white drop-shadow">
                    {currentDish.name}
                  </h3>
                  <p className="text-xs text-stone-300 font-medium">
                    {currentDish.cookingNote}
                  </p>
                </div>
              </div>

              {/* Dish Details Strip & Action Button */}
              <div className="flex items-center justify-between gap-3 px-1 pt-1">
                <div className="text-left space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                      Pure Vegetarian
                    </span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      {currentDish.spiceTag}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 line-clamp-1">
                    {currentDish.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenDishDetail && onOpenDishDetail(currentDish.menuItemId)}
                  className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white font-bold text-xs transition-all shadow-lg shadow-orange-600/30 flex items-center gap-1.5 shrink-0"
                >
                  <Eye size={14} />
                  <span>View Details</span>
                </button>
              </div>

              {/* Signature Dish Selector Tabs */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-1.5">
                {SIGNATURE_DISHES.map((dish, idx) => (
                  <button
                    key={dish.id}
                    type="button"
                    onClick={() => setActiveDishIndex(idx)}
                    className={`flex-1 py-2 px-1 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
                      activeDishIndex === idx
                        ? 'bg-orange-600/90 text-white shadow-md border border-orange-400/40'
                        : 'text-stone-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="text-base">{idx === 0 ? '🍲' : idx === 1 ? '🍢' : idx === 2 ? '🫓' : '🍚'}</span>
                    <span className="text-[11px] font-medium leading-none truncate max-w-[80px]">
                      {dish.name.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Culinary3DHero;
