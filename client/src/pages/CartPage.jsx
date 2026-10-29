import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, Package, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { processCheckout } from '../utils/api';

function validateForm(form) {
  const errors = {};
  if (!form.name || form.name.trim().length < 2) errors.name = 'Full name is required (min 2 chars)';
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Valid email is required';
  if (!form.address || form.address.trim().length < 10) errors.address = 'Full shipping address required (min 10 chars)';
  if (!/^\d{16}$/.test(form.card.replace(/\s/g, ''))) errors.card = 'Card number must be exactly 16 digits';
  if (!/^\d{2}\/\d{2}$/.test(form.expiry)) errors.expiry = 'Expiry must be MM/YY format';
  if (!/^\d{3,4}$/.test(form.cvv)) errors.cvv = 'CVV must be 3-4 digits';
  return errors;
}

export default function CartPage() {
  const { items, totalItems, totalAmount, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    address: '',
    card: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);

  const handleChange = (field, value) => {
    // Format card number with spaces
    if (field === 'card') {
      value = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
    }
    // Format expiry
    if (field === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length >= 3) value = value.slice(0, 2) + '/' + value.slice(2);
    }
    // CVV
    if (field === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 4);
    }

    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (items.length === 0) return;

    setIsProcessing(true);
    try {
      const checkoutPayload = {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: parseFloat(item.price),
          name: item.name,
        })),
        shippingAddress: form.address,
        name: form.name,
        creditCard: form.card.replace(/\s/g, ''),
        email: form.email,
      };

      const result = await processCheckout(checkoutPayload);
      clearCart();
      setOrderComplete(result);
    } catch (err) {
      const msg = err.response?.data?.error || 'Checkout failed. Please try again.';
      setErrors({ general: msg });
    } finally {
      setIsProcessing(false);
    }
  };

  // Order Success Screen
  if (orderComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-8 animate-bounce-in">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Order Confirmed! 🎉</h2>
          <p className="text-slate-400 mb-4">
            Your order has been placed successfully. Thank you for shopping at AI Mall!
          </p>
          <div className="bg-slate-800 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Order ID</span>
              <span className="text-white font-mono text-xs">{orderComplete.orderId?.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Items</span>
              <span className="text-white">{orderComplete.itemCount}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">Total Paid</span>
              <span className="text-green-400 text-lg">${parseFloat(orderComplete.totalAmount).toFixed(2)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Link to="/orders" className="flex-1 btn-primary text-center">
              View Orders
            </Link>
            <Link to="/" className="flex-1 btn-secondary text-center">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary-400" />
            Your Cart
          </h1>
          <p className="text-slate-400 text-sm">{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-5">
            <Package className="w-12 h-12 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your cart is empty</h3>
          <p className="text-slate-400 mb-6">Add some products to get started!</p>
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Browse the Mall
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start">
          {/* Cart Items */}
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="card p-4 flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 bg-slate-700 rounded-xl overflow-hidden flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-slate-500" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/product/${item.id}`}
                    className="font-semibold text-white hover:text-primary-400 transition-colors line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  {item.store_name && (
                    <p className="text-xs text-slate-400 mt-0.5">{item.store_name}</p>
                  )}
                  <p className="text-primary-400 font-bold mt-1">
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500">${parseFloat(item.price).toFixed(2)} each</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-l-lg transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-white">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-r-lg transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-slate-500 hover:text-red-400 transition-colors"
            >
              Clear cart
            </button>
          </div>

          {/* Checkout Form */}
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-400" />
              Checkout
            </h2>

            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl mb-4">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleCheckout} className="space-y-4">
              {/* Personal Info */}
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="John Doe"
                  className={`input-field w-full text-sm ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className={`input-field w-full text-sm ${errors.email ? 'border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1.5">Shipping Address *</label>
                <textarea
                  value={form.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                  rows={2}
                  className={`input-field w-full text-sm resize-none ${errors.address ? 'border-red-500' : ''}`}
                />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* Payment */}
              <div className="border-t border-slate-700 pt-4">
                <p className="text-xs text-slate-400 font-medium mb-3">Payment Info (Demo Only)</p>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1.5">Card Number *</label>
                  <input
                    type="text"
                    value={form.card}
                    onChange={(e) => handleChange('card', e.target.value)}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={`input-field w-full text-sm font-mono ${errors.card ? 'border-red-500' : ''}`}
                  />
                  {errors.card && <p className="text-red-400 text-xs mt-1">{errors.card}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1.5">Expiry (MM/YY) *</label>
                    <input
                      type="text"
                      value={form.expiry}
                      onChange={(e) => handleChange('expiry', e.target.value)}
                      placeholder="12/28"
                      maxLength={5}
                      className={`input-field w-full text-sm ${errors.expiry ? 'border-red-500' : ''}`}
                    />
                    {errors.expiry && <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 font-medium mb-1.5">CVV *</label>
                    <input
                      type="text"
                      value={form.cvv}
                      onChange={(e) => handleChange('cvv', e.target.value)}
                      placeholder="123"
                      maxLength={4}
                      className={`input-field w-full text-sm ${errors.cvv ? 'border-red-500' : ''}`}
                    />
                    {errors.cvv && <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Shipping</span>
                  <span className="text-green-400">FREE</span>
                </div>
                <div className="flex justify-between font-bold text-white text-lg border-t border-slate-700 pt-2">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all active:scale-98 disabled:opacity-70 shadow-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Place Order · ${totalAmount.toFixed(2)}
                  </>
                )}
              </button>

              <p className="text-xs text-slate-500 text-center">
                🔒 This is a simulated checkout. No real payment is processed.
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

