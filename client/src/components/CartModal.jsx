import React from 'react';
import { X, ShoppingCart, Plus, Minus, Trash2, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartModal({ isOpen, onClose }) {
  const { items, totalItems, totalAmount, removeFromCart, updateQuantity, clearCart } = useCart();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[440px] bg-slate-900 border-l border-slate-700 z-50 flex flex-col shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5 text-primary-400" />
            <h2 className="font-bold text-lg text-white">Your Cart</h2>
            {totalItems > 0 && (
              <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-slate-500" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white">Your cart is empty</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Browse the mall or ask the AI Concierge for recommendations
                </p>
              </div>
              <button
                onClick={onClose}
                className="btn-primary text-sm"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-4 hover:bg-slate-800/50 transition-colors">
                  {/* Image */}
                  <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-500" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white line-clamp-2 leading-tight">
                      {item.name}
                    </p>
                    {item.store_name && (
                      <p className="text-xs text-slate-400 mt-0.5">{item.store_name}</p>
                    )}
                    <p className="text-primary-400 font-bold text-sm mt-1">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div className="flex items-center gap-1 bg-slate-800 rounded-lg border border-slate-700">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-l-lg transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-r-lg transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-slate-700 space-y-3">
            {/* Order Summary */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Shipping</span>
                <span className="text-green-400">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-white text-lg border-t border-slate-700 pt-2 mt-2">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <Link
              to="/cart"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-98 shadow-lg"
            >
              Proceed to Checkout
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button
              onClick={onClose}
              className="w-full text-slate-400 hover:text-white text-sm py-2 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

