import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function AIProductCarousel({ products }) {
  const { addToCart, isInCart } = useCart();

  if (!products || products.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wide">
        ✨ Recommended Products
      </p>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {products.map((product) => {
          const inCart = isInCart(product.id);
          const price = parseFloat(product.price);

          return (
            <div
              key={product.id}
              className="flex-shrink-0 w-44 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-primary-500 transition-all group"
            >
              {/* Product Image */}
              <div className="h-28 bg-slate-700 overflow-hidden relative">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-600">
                    <span className="text-3xl">📦</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-2.5">
                <p className="text-xs text-primary-400 font-medium truncate">
                  {product.store_name}
                </p>
                <p className="text-sm font-semibold text-white line-clamp-2 leading-tight mt-0.5">
                  {product.name}
                </p>
                <p className="text-base font-bold text-white mt-1.5">
                  ${price.toFixed(2)}
                </p>

                {/* Actions */}
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity === 0 || inCart}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95 ${
                      inCart
                        ? 'bg-green-700 text-white'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    } disabled:opacity-50`}
                  >
                    <ShoppingCart className="w-3 h-3" />
                    {inCart ? 'Added' : 'Add'}
                  </button>
                  <Link
                    to={`/product/${product.id}`}
                    className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    title="View details"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

