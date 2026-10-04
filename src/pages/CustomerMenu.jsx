import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ShoppingCart, MapPin, Phone, Clock, Info, CheckCircle, ArrowLeft } from 'lucide-react';
import useMenuStore from '../store/menuStore';
import useCartStore from '../store/cartStore';
import useOrderStore from '../store/orderStore';
import MenuCard from '../components/customer/MenuCard';
import ItemDetailModal from '../components/customer/ItemDetailModal';
import CartDrawer from '../components/customer/CartDrawer';
import mittiCover from '../assets/mitti-farms-main.jpg';

const CustomerMenu = () => {
  const { restaurant, categories, menuItems } = useMenuStore();
  const cartItems = useCartStore((s) => s.items);
  const getCartCount = useCartStore((s) => s.getCartCount);
  const getCartTotal = useCartStore((s) => s.getCartTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const placeOrder = useOrderStore((s) => s.placeOrder);
  const currentOrder = useOrderStore((s) => s.currentOrder);
  const clearCurrentOrder = useOrderStore((s) => s.clearCurrentOrder);

  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const categoryRefs = useRef({});
  const categoryNavRef = useRef(null);

  // Featured items
  const featuredItems = useMemo(
    () => menuItems.filter((item) => item.isFeatured),
    [menuItems]
  );

  // Filtered items for search
  const filteredMenuItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems;
    const q = searchQuery.toLowerCase();
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    );
  }, [menuItems, searchQuery]);

  // Scroll to category
  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    if (categoryId === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = categoryRefs.current[categoryId];
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Intersection observer for scroll spy
  useEffect(() => {
    if (searchQuery) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            setActiveCategory(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-150px 0px -50% 0px' }
    );
    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [searchQuery, categories]);

  // Place order handler
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) return;
    const order = placeOrder({
      items: cartItems,
      table: tableNumber,
      cartTotal: getCartTotal(),
    });
    clearCart();
    setIsCartOpen(false);
    setOrderPlaced(true);
  };

  // Dismiss order confirmation
  const dismissOrder = () => {
    setOrderPlaced(false);
    clearCurrentOrder();
  };

  const cartCount = getCartCount();

  // ─── Order Confirmation Screen ──────────────────────────────
  if (orderPlaced && currentOrder) {
    return (
      <div className="min-h-screen bg-surface-50 max-w-2xl mx-auto shadow-xl flex items-center justify-center p-6">
        <div className="text-center space-y-6 w-full max-w-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full">
            <CheckCircle size={40} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-surface-900">Order Confirmed!</h1>
          <div className="bg-white rounded-2xl p-5 border border-surface-100 shadow-sm text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-surface-500 text-sm">Order ID</span>
              <span className="font-bold text-surface-900">{currentOrder.id}</span>
            </div>
            {tableNumber && (
              <div className="flex justify-between">
                <span className="text-surface-500 text-sm">Table</span>
                <span className="font-bold text-brand-600">Table {tableNumber}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-surface-500 text-sm">Items</span>
              <span className="font-semibold text-surface-900">{currentOrder.items.length}</span>
            </div>
            <div className="border-t border-surface-100 pt-3 flex justify-between">
              <span className="font-semibold text-surface-700">Total</span>
              <span className="text-xl font-extrabold text-brand-600">₹{currentOrder.total}</span>
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm text-surface-500">Your order has been sent to the kitchen.</p>
            <button onClick={dismissOrder} className="btn-primary w-full py-3">
              Browse Menu Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Menu ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface-50 pb-24 max-w-2xl mx-auto relative shadow-xl overflow-x-hidden">
      {/* Restaurant Header with Real Cover Photo */}
      <header className="relative bg-surface-900 text-white rounded-b-3xl shadow-xl overflow-hidden mb-1">
        {/* Real photo banner */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          <img
            src={mittiCover}
            alt={restaurant.name}
            className="w-full h-full object-cover brightness-[0.82] scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/50 to-black/30" />
          
          {/* Top floating row: Table badge and Info link */}
          <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between z-10">
            {tableNumber ? (
              <span className="px-3.5 py-1 bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-bold border border-white/20 shadow-sm flex items-center gap-1.5">
                🪑 Table {tableNumber}
              </span>
            ) : (
              <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white/90 rounded-full text-[11px] font-semibold border border-white/10">
                🌿 Mitti Farms Menu
              </span>
            )}
            
            <Link
              to="/about"
              className="px-3 py-1 bg-black/50 hover:bg-black/70 backdrop-blur-md rounded-full text-xs font-bold text-white transition-colors border border-white/20 flex items-center gap-1"
            >
              <Info size={13} /> About & Photos
            </Link>
          </div>

          {/* Status Badge floating on image */}
          <div className="absolute bottom-3 right-4 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1.5 ${
              restaurant.isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
            }`}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {restaurant.isOpen ? 'OPEN NOW' : 'CLOSED'}
            </span>
          </div>
        </div>

        {/* Content directly below banner */}
        <div className="px-5 pt-3.5 pb-4 text-left bg-gradient-to-b from-surface-950 to-surface-900 border-t border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌿</span>
                <h1 className="text-2xl font-black tracking-tight text-white">{restaurant.name}</h1>
              </div>
              <p className="text-emerald-300 text-xs font-semibold mt-0.5">{restaurant.subname || 'Chulha Bistro & Farmstay'}</p>
            </div>
            <span className="text-[11px] bg-white/10 text-brand-300 px-2.5 py-1 rounded-lg border border-white/10 font-medium shrink-0">
              {restaurant.tagline}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[11px] text-surface-300 border-t border-white/5 pt-2.5">
            <span className="flex items-center gap-1"><MapPin size={12} className="text-brand-400" /> {restaurant.address}</span>
            <a href={`tel:${restaurant.phone}`} className="flex items-center gap-1 hover:text-white transition-colors">
              <Phone size={12} className="text-emerald-400" /> {restaurant.phone}
            </a>
            <span className="flex items-center gap-1"><Clock size={12} className="text-blue-400" /> {restaurant.hours.weekdays}</span>
          </div>
        </div>
      </header>

      {/* Search Bar — sticky */}
      <div className="sticky top-0 z-30 bg-surface-50/95 backdrop-blur-md px-4 py-2.5 shadow-sm border-b border-surface-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={17} />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-surface-200 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Category Nav — sticky */}
      {!searchQuery && (
        <div
          ref={categoryNavRef}
          className="sticky top-[56px] z-20 bg-surface-50/95 backdrop-blur-md px-4 py-2.5 border-b border-surface-100 overflow-x-auto scrollbar-hide flex gap-2"
        >
          <button
            onClick={() => scrollToCategory('all')}
            className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
              activeCategory === 'all'
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white text-surface-600 border border-surface-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors flex items-center gap-1 ${
                activeCategory === cat.id
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white text-surface-600 border border-surface-200'
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Menu Content */}
      <main className="px-4 py-5">
        {searchQuery ? (
          /* Search results */
          <div>
            <h2 className="text-lg font-bold text-surface-900 mb-3">
              Results for "{searchQuery}"
            </h2>
            {filteredMenuItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredMenuItems.map((item) => (
                  <MenuCard key={item.id} item={item} onOpenDetail={setSelectedItem} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-surface-500">
                <p className="text-lg mb-1">😕</p>
                <p>No dishes found.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Featured */}
            {featuredItems.length > 0 && activeCategory === 'all' && (
              <section>
                <h2 className="text-lg font-bold text-surface-900 mb-3 flex items-center gap-2">
                  <span className="text-brand-500">⭐</span> Popular Dishes
                </h2>
                <div className="flex overflow-x-auto gap-3 pb-3 scrollbar-hide snap-x">
                  {featuredItems.map((item) => (
                    <div key={item.id} className="min-w-[220px] max-w-[260px] snap-start flex-shrink-0">
                      <MenuCard item={item} onOpenDetail={setSelectedItem} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Sections by category */}
            {categories.map((category) => {
              const items = menuItems.filter((item) => item.category === category.id);
              if (items.length === 0) return null;
              return (
                <section
                  key={category.id}
                  id={category.id}
                  ref={(el) => (categoryRefs.current[category.id] = el)}
                  className="scroll-mt-32"
                >
                  <h2 className="text-xl font-bold text-surface-900 mb-3 pb-2 border-b border-surface-100 flex items-center gap-2">
                    <span>{category.icon}</span> {category.name}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* Cart FAB */}
      {cartCount > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-5 right-4 z-40 bg-brand-600 hover:bg-brand-700 text-white shadow-xl rounded-2xl px-5 py-3.5 flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95"
          style={{ maxWidth: 'calc(100vw - 2rem)' }}
        >
          <div className="relative">
            <ShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-white text-brand-600 text-[10px] font-extrabold w-5 h-5 flex items-center justify-center rounded-full shadow">
              {cartCount}
            </span>
          </div>
          <span className="font-bold text-sm">View Cart</span>
          <span className="font-extrabold">₹{getCartTotal()}</span>
        </button>
      )}

      {/* Footer */}
      <footer className="mt-10 text-center py-8 border-t border-surface-200/60 text-surface-400 text-xs space-y-2">
        <p className="font-semibold text-surface-600">{restaurant.name} · {restaurant.subname || 'Chulha Bistro'}</p>
        <p className="text-[11px] text-surface-400">{restaurant.address}</p>
        <div className="flex items-center justify-center gap-4 pt-1 text-xs">
          <Link to="/about" className="text-brand-600 hover:text-brand-700 font-medium">
            About & Photos
          </Link>
          <span className="text-surface-300">·</span>
          <Link to="/login" className="text-surface-500 hover:text-brand-600 font-medium">
            🔒 Staff Login
          </Link>
        </div>
        <p className="text-[10px] text-surface-400 pt-1">Mitti Farms Smart QR Menu System © {new Date().getFullYear()}</p>
      </footer>

      {/* Modals & Drawers */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        tableNumber={tableNumber}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
};

export default CustomerMenu;
