import React, { useState } from 'react';
import { X, Minus, Plus, Trash2, UtensilsCrossed, ArrowRight, Clock, ChefHat } from 'lucide-react';
import useCartStore from '../../store/cartStore';
import useMenuStore from '../../store/menuStore';

export const CartDrawer = ({ isOpen, onClose, tableNumber, onPlaceOrder }) => {
  const restaurant = useMenuStore((s) => s.restaurant);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const getCartTotal = useCartStore((s) => s.getCartTotal);

  const [cookingNote, setCookingNote] = useState('');

  if (!isOpen) return null;

  const total = getCartTotal();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleConfirmOrder = () => {
    onPlaceOrder();
  };

  return (
    <>
      {/* Backdrop with dark blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col text-left animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-900 text-white">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧺</span>
              <h2 className="text-xl font-serif font-bold text-white">Your Dining Tray</h2>
            </div>
            {tableNumber ? (
              <p className="text-xs text-amber-400 font-bold mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Table {tableNumber}</span>
                <span className="text-stone-400 font-normal">· Instant Kitchen Ticket</span>
              </p>
            ) : (
              <p className="text-xs text-stone-300 font-medium mt-0.5">
                {restaurant.name} {restaurant.subname ? `· ${restaurant.subname}` : '· Table Dining'}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-stone-300 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-stone-50/70 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-stone-400">
              <div className="w-20 h-20 rounded-full bg-orange-50 border border-orange-200/80 flex items-center justify-center text-3xl shadow-inner">
                🍲
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-stone-800 mb-1">
                  Your tray is empty
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
                  Explore our authentic slow-cooked chulha specialties and tap Add to place an order.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-orange-600 text-white text-xs font-bold hover:bg-orange-500 shadow-md transition-all"
              >
                Browse Menu Dishes
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-stone-500 pb-1 px-1">
                <span className="font-semibold">{itemCount} dish{itemCount !== 1 ? 'es' : ''} in your tray</span>
                <button
                  onClick={clearCart}
                  className="text-stone-400 hover:text-rose-600 font-medium transition-colors"
                >
                  Clear all
                </button>
              </div>

              {items.map((ci) => (
                <div
                  key={ci.cartId}
                  className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-2.5 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm leading-snug">
                        {ci.name}
                      </h4>
                      <span className="text-xs text-stone-500 font-medium tabular-nums">
                        ₹{ci.itemTotal} per plate
                      </span>
                    </div>
                    <span className="font-serif font-black text-orange-700 text-base tabular-nums shrink-0">
                      ₹{ci.itemTotal * ci.quantity}
                    </span>
                  </div>

                  {/* Customizations tags */}
                  {ci.selectedCustomizations?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {ci.selectedCustomizations.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200"
                        >
                          {c.optionName}
                          {c.price > 0 && <span className="text-orange-600 font-bold ml-1">+₹{c.price}</span>}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                    <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                      <button
                        onClick={() => updateQuantity(ci.cartId, ci.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs hover:bg-stone-50"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-stone-900 tabular-nums">
                        {ci.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(ci.cartId, ci.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-stone-700 shadow-xs hover:bg-stone-50"
                        aria-label="Increase quantity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(ci.cartId)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove dish"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Kitchen Note Field */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block mb-1">
                  Kitchen Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, extra crispy roti, salad on the side..."
                  value={cookingNote}
                  onChange={(e) => setCookingNote(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 bg-white placeholder:text-stone-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none"
                />
              </div>

              {/* Live Kitchen Time Banner */}
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200/60 flex items-center gap-2.5 text-xs text-orange-800 font-medium">
                <Clock size={16} className="text-orange-600 shrink-0" />
                <span>Estimated cooking & hearth time: ~15 to 20 minutes</span>
              </div>
            </>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-5 bg-white border-t border-stone-200 space-y-3.5 shadow-2xl">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal ({itemCount} dishes)</span>
                <span className="font-semibold text-stone-900 tabular-nums">₹{total}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-400">
                <span>Taxes & Chulha Kitchen Service</span>
                <span className="text-emerald-600 font-semibold">Included</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-stone-100">
                <span className="font-bold text-stone-900 text-base">Grand Bill</span>
                <span className="font-serif font-black text-2xl text-orange-700 tabular-nums">
                  ₹{total}
                </span>
              </div>
            </div>

            <button
              onClick={handleConfirmOrder}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 active:from-orange-700 active:to-amber-700 text-white font-bold text-base transition-all duration-200 shadow-xl shadow-orange-600/25 flex items-center justify-center gap-2.5 hover:translate-y-[-1px]"
            >
              <UtensilsCrossed size={18} />
              <span>Dispatch Order to Kitchen</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
