import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, ChevronDown, ChevronUp, ShoppingBag, Search } from 'lucide-react';
import { fetchOrders } from '../utils/api';
import { useAuth } from '../context/AuthContext';

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const items = order.items || [];
  const createdAt = new Date(order.created_at);

  return (
    <div className="card overflow-visible animate-fade-in">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-800/30 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-primary-400" />
          </div>
          <div>
            <p className="text-white font-semibold">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-slate-400 text-sm">
              {createdAt.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white font-bold text-lg">${parseFloat(order.total_amount).toFixed(2)}</p>
            <span className="inline-block bg-green-500/20 border border-green-500/30 text-green-400 text-xs px-2.5 py-0.5 rounded-full capitalize">
              {order.status}
            </span>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 p-5 space-y-3 animate-fade-in">
          {order.shipping_address && (
            <div className="bg-slate-800/50 rounded-xl p-3 mb-4">
              <p className="text-xs text-slate-400 font-medium mb-1">Shipped to:</p>
              <p className="text-sm text-white">{order.shipping_address}</p>
            </div>
          )}

          <p className="text-sm font-semibold text-slate-300 mb-3">
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>

          {items.filter(Boolean).map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                {item.product_image ? (
                  <img
                    src={item.product_image}
                    alt={item.product_name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-slate-500" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium truncate">
                  {item.product_name || 'Product'}
                </p>
                {item.store_name && (
                  <p className="text-xs text-slate-400">{item.store_name}</p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm text-white font-semibold">
                  ${(parseFloat(item.price_at_time) * item.quantity).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">
                  Qty: {item.quantity} × ${parseFloat(item.price_at_time).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.email) {
      loadOrders(user.email);
    }
  }, [user]);

  const loadOrders = async (emailToSearch) => {
    if (!emailToSearch) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchOrders(emailToSearch);
      setOrders(data.orders || []);
      setSearched(true);
    } catch (err) {
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (email.trim()) loadOrders(email.trim());
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/" className="text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-400" />
            Order History
          </h1>
          <p className="text-slate-400 text-sm">View your past purchases</p>
        </div>
      </div>

      {/* Email Search */}
      {!user && (
        <div className="card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-1">Look Up Your Orders</h2>
          <p className="text-slate-400 text-sm mb-4">Enter the email you used during checkout.</p>
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="input-field w-full pl-10 text-sm"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary px-5 flex-shrink-0">
              {loading ? 'Loading...' : 'Search'}
            </button>
          </form>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      )}

      {/* Orders List */}
      {!loading && searched && (
        <>
          {orders.length === 0 ? (
            <div className="text-center py-16 card">
              <ShoppingBag className="w-14 h-14 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No Orders Found</h3>
              <p className="text-slate-400 mb-6">
                No orders associated with this email address yet.
              </p>
              <Link to="/" className="btn-primary inline-flex items-center gap-2">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">
                {orders.length} order{orders.length !== 1 ? 's' : ''} found
              </p>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Not searched yet prompt */}
      {!loading && !searched && !user && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Enter your email above to view your orders.</p>
        </div>
      )}
    </div>
  );
}

