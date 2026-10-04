import React from 'react';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import useCartStore from '../../store/cartStore';

const CartDrawer = ({ isOpen, onClose, tableNumber, onPlaceOrder }) => {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const clearCart = useCartStore((s) => s.clearCart);
  const getCartTotal = useCartStore((s) => s.getCartTotal);

  if (!isOpen) return null;

  const total = getCartTotal();

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-100">
          <div>
            <h2 className="text-xl font-bold text-surface-900">Your Order</h2>
            {tableNumber && (
              <p className="text-xs text-brand-600 font-semibold mt-0.5">🪑 Table {tableNumber}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-100 rounded-full text-surface-500">
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 bg-surface-50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-surface-500 space-y-3">
              <span className="text-5xl">🛒</span>
              <h3 className="text-lg font-semibold text-surface-700">Your cart is empty</h3>
              <p className="text-sm">Browse our menu to add dishes</p>
              <button onClick={onClose} className="btn-primary mt-2">Browse Menu</button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-end">
                <button onClick={clearCart} className="text-xs text-surface-400 hover:text-red-500 underline">
                  Clear cart
                </button>
              </div>

              {items.map((ci) => (
                <div key={ci.cartId} className="bg-white p-3.5 rounded-xl shadow-sm border border-surface-100">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-surface-900 text-sm">{ci.name}</h4>
                    <span className="font-bold text-surface-900 shrink-0 ml-2 text-sm">₹{ci.itemTotal * ci.quantity}</span>
                  </div>

                  {ci.selectedCustomizations?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {ci.selectedCustomizations.map((c, i) => (
                        <span key={i} className="inline-block bg-surface-100 text-surface-600 px-2 py-0.5 rounded text-[11px] font-medium">
                          {c.optionName}{c.price > 0 ? ` +₹${c.price}` : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center bg-surface-100 rounded-lg p-0.5">
                      <button onClick={() => updateQuantity(ci.cartId, ci.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-white text-surface-700 shadow-sm">
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-xs font-bold">{ci.quantity}</span>
                      <button onClick={() => updateQuantity(ci.cartId, ci.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded bg-white text-surface-700 shadow-sm">
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(ci.cartId)}
                      className="text-surface-400 hover:text-red-500 p-1.5 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 bg-white border-t border-surface-100 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-surface-600 font-medium">Subtotal</span>
              <span className="text-xl font-extrabold text-surface-900">₹{total}</span>
            </div>

            <button
              onClick={onPlaceOrder}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white py-3.5 rounded-xl font-bold text-base transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <ShoppingBag size={20} />
              Confirm Order · ₹{total}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
