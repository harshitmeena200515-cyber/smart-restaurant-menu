import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Phone, Clock, Info, ArrowLeft, Utensils, Sparkles, Flame, Leaf, Filter, X } from 'lucide-react';
import useMenuStore from '../store/menuStore';
import MenuCard from '../components/customer/MenuCard';
import ItemDetailModal from '../components/customer/ItemDetailModal';
import Culinary3DHero from '../components/customer/Culinary3DHero';

const CustomerMenu = () => {
  const { restaurant, categories, menuItems } = useMenuStore();

  const [searchParams] = useSearchParams();
  const tableNumber =
    searchParams.get('table') ||
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('table')
      : null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [dietaryFilter, setDietaryFilter] = useState('all'); // 'all', 'veg', 'featured', 'spicy'
  const [selectedItem, setSelectedItem] = useState(null);

  const categoryRefs = useRef({});
  const categoryNavRef = useRef(null);
  const menuStartRef = useRef(null);

  // Featured items
  const featuredItems = useMemo(
    () => menuItems.filter((item) => item.isFeatured),
    [menuItems]
  );

  // Filtered items based on search and dietary preferences
  const filteredMenuItems = useMemo(() => {
    let items = menuItems;

    // Apply dietary filter
    if (dietaryFilter === 'veg') {
      items = items.filter((item) => item.isVeg);
    } else if (dietaryFilter === 'featured') {
      items = items.filter((item) => item.isFeatured);
    } else if (dietaryFilter === 'spicy') {
      items = items.filter((item) => item.isSpicy);
    }

    // Apply search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
    }

    return items;
  }, [menuItems, searchQuery, dietaryFilter]);

  // Scroll to category
  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId === 'all') {
      if (menuStartRef.current) {
        menuStartRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 380, behavior: 'smooth' });
      }
      return;
    }
    const el = categoryRefs.current[categoryId];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 130;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Intersection observer for category scroll spy
  useEffect(() => {
    if (searchQuery || dietaryFilter !== 'all') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.25) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { threshold: 0.25, rootMargin: '-130px 0px -50% 0px' }
    );
    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [searchQuery, dietaryFilter, categories]);

  // Place order handler
  // Open item modal from Hero by itemId
  const handleOpenDishFromHero = (itemId) => {
    const item = menuItems.find((i) => i.id === itemId);
    if (item) {
      setSelectedItem(item);
    } else {
      scrollToCategory('all');
    }
  };

  // ─── Main Customer Experience ───────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50 pb-32 w-full max-w-7xl mx-auto relative shadow-2xl overflow-x-hidden">
      {/* 3D Interactive Culinary Hero (Food-focused, NO exterior photos) */}
      <Culinary3DHero
        restaurant={restaurant}
        tableNumber={tableNumber}
        onExploreClick={() => scrollToCategory('all')}
        onOpenDishDetail={handleOpenDishFromHero}
      />

      {/* Sticky Bar 1: Search & Dietary Quick Filters */}
      <div
        ref={menuStartRef}
        className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3 border-b border-stone-200/90 shadow-sm"
      >
        <div className="max-w-4xl mx-auto space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
                size={17}
              />
              <input
                type="text"
                placeholder="Search dishes, tandoor specials, gravies, rotis, biryanis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-100/80 border border-stone-200 rounded-full py-2.5 pl-10 pr-10 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 focus:bg-white shadow-inner transition-all placeholder:text-stone-400 font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {tableNumber && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 font-bold text-xs shrink-0">
                <span>🪑</span>
                <span>Table {tableNumber}</span>
              </div>
            )}
          </div>

          {/* Quick Dietary / Preference Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide text-xs pt-0.5">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter size={12} />
              Filter:
            </span>

            <button
              type="button"
              onClick={() => setDietaryFilter('all')}
              className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 ${
                dietaryFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All Items
            </button>

            <button
              type="button"
              onClick={() => setDietaryFilter('veg')}
              className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 flex items-center gap-1 ${
                dietaryFilter === 'veg'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Pure Veg Only</span>
            </button>

            <button
              type="button"
              onClick={() => setDietaryFilter('featured')}
              className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 flex items-center gap-1 ${
                dietaryFilter === 'featured'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100'
              }`}
            >
              <Sparkles size={12} />
              <span>Chef's Choice</span>
            </button>

            <button
              type="button"
              onClick={() => setDietaryFilter('spicy')}
              className={`px-3 py-1 rounded-full font-bold transition-all shrink-0 flex items-center gap-1 ${
                dietaryFilter === 'spicy'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-800 border border-rose-200/80 hover:bg-rose-100'
              }`}
            >
              <Flame size={12} />
              <span>Spicy Bites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bar 2: Category Navigation Strip */}
      {!searchQuery && dietaryFilter === 'all' && (
        <div
          ref={categoryNavRef}
          className="sticky top-[95px] z-20 bg-stone-50/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-2.5 border-b border-stone-200/80 overflow-x-auto scrollbar-hide flex gap-2 sm:gap-2.5 items-center justify-start max-w-7xl mx-auto shadow-xs"
        >
          <button
            onClick={() => scrollToCategory('all')}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 ${
              activeCategory === 'all'
                ? 'bg-orange-600 text-white shadow-orange-600/25 ring-1 ring-orange-700'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <span>✨</span>
            <span>All Dishes</span>
            <span className="text-[10px] opacity-75 font-mono">({menuItems.length})</span>
          </button>

          {categories.map((cat) => {
            const count = menuItems.filter((i) => i.category === cat.id).length;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-orange-600/25 ring-1 ring-orange-700'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-70 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Menu Dish Grid Container */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 max-w-7xl mx-auto text-left">
        {searchQuery || dietaryFilter !== 'all' ? (
          /* Search or Filter results view */
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-stone-200 pb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                  {searchQuery ? `Dishes matching "${searchQuery}"` : 'Filtered Culinary Selection'}
                </h2>
                {dietaryFilter !== 'all' && (
                  <span className="text-xs text-orange-600 font-semibold block mt-0.5">
                    Filter Active: {dietaryFilter === 'veg' ? 'Pure Veg' : dietaryFilter === 'featured' ? "Chef's Specials" : 'Spicy Dishes'}
                  </span>
                )}
              </div>
              <span className="text-xs text-stone-500 font-medium font-mono">
                {filteredMenuItems.length} dishes found
              </span>
            </div>

            {filteredMenuItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredMenuItems.map((item) => (
                  <MenuCard key={item.id} item={item} onOpenDetail={setSelectedItem} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-stone-500 space-y-3 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
                <span className="text-5xl block">🔍</span>
                <p className="font-serif font-bold text-lg text-stone-800">
                  No dishes found matching your search
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Try searching for keywords like "Paneer", "Dal", "Tandoori Roti", "Biryani", or reset the filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setDietaryFilter('all');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-500 transition-all shadow-md"
                >
                  Clear Filters & Show All
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 sm:space-y-16">
            {/* Featured / Signature Highlights Carousel */}
            {featuredItems.length > 0 && activeCategory === 'all' && (
              <section className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                      Chef's Special Recommendations
                    </h2>
                  </div>
                  <span className="text-xs text-orange-600 font-bold hidden sm:inline">
                    Authentic Chulha Recipes
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {featuredItems.map((item) => (
                    <MenuCard key={item.id} item={item} onOpenDetail={setSelectedItem} />
                  ))}
                </div>
              </section>
            )}

            {/* Sections by Category */}
            {categories.map((category) => {
              const items = menuItems.filter((item) => item.category === category.id);
              if (items.length === 0) return null;

              return (
                <section
                  key={category.id}
                  id={category.id}
                  ref={(el) => (categoryRefs.current[category.id] = el)}
                  className="scroll-mt-36 space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{category.icon}</span>
                      <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                        {category.name}
                      </h2>
                    </div>
                    <span className="text-xs text-stone-400 font-mono font-medium">
                      {items.length} dish{items.length !== 1 ? 'es' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {items.map((item) => (
                      <MenuCard key={item.id} item={item} onOpenDetail={setSelectedItem} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* Restaurant Footer */}
      <footer className="mt-16 text-center py-12 border-t border-stone-200 text-stone-500 text-xs space-y-3 bg-white">
        <div className="flex items-center justify-center gap-2 font-serif font-bold text-sm text-stone-900">
          {restaurant.logo && (restaurant.logo.startsWith('http') || restaurant.logo.startsWith('data:') || restaurant.logo.startsWith('/')) ? (
            <img src={restaurant.logo} alt={restaurant.name} className="w-5 h-5 rounded-md object-cover inline-block" />
          ) : (
            <span className="w-5 h-5 rounded-md bg-stone-100 text-stone-700 font-serif font-bold text-xs inline-flex items-center justify-center border border-stone-200">
              {restaurant.name ? restaurant.name.charAt(0).toUpperCase() : 'M'}
            </span>
          )}
          <span>{restaurant.name}</span>
          {restaurant.subname && (
            <>
              <span className="text-stone-300">·</span>
              <span className="font-sans font-medium text-xs text-stone-500">{restaurant.subname}</span>
            </>
          )}
        </div>

        <p className="text-[11px] text-stone-400 max-w-md mx-auto px-4">
          <a
            href={restaurant.mapsUrl || "https://maps.app.goo.gl/hfSZ3f2jdc53tvbx7"}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-600 transition-colors"
          >
            {restaurant.address} ↗
          </a>
        </p>

        <div className="flex items-center justify-center gap-4 pt-1 text-xs">
          <Link to="/about" className="text-orange-600 hover:text-orange-700 font-semibold">
            About &amp; Farmstay Photographs
          </Link>
          <span className="text-stone-300">·</span>
          <Link to="/login" className="text-stone-400 hover:text-stone-700 font-medium">
            🔒 Staff &amp; Admin Login
          </Link>
        </div>

        <p className="text-[10px] text-stone-400 pt-2">
          {restaurant.name} {restaurant.subname ? `(${restaurant.subname})` : ''} Smart QR Digital Menu © {new Date().getFullYear()}
        </p>
        <p className="text-[10px] text-stone-400">
          Website by [YOUR NAME / BRAND]
        </p>
      </footer>

      {/* Item Detail Modal for Viewing Dishes & Portion Sizes */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
};

export default CustomerMenu;
