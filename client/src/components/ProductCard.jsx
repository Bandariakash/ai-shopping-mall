import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, Star, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, compact = false }) {
  const { addToCart, isInCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = isInCart(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const priceNum = parseFloat(product.price);

  return (
    <Link
      to={`/product/${product.id}`}
      className={`card group hover:border-primary-500 hover:-translate-y-1 transition-all duration-300 block ${
        compact ? 'flex gap-3 p-3' : ''
      }`}
    >
      {/* Product Image */}
      <div
        className={`relative overflow-hidden bg-slate-700 flex-shrink-0 ${
          compact ? 'w-20 h-20 rounded-lg' : 'h-52'
        }`}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              compact ? 'rounded-lg' : ''
            }`}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-12 h-12 text-slate-500" />
          </div>
        )}
        {product.stock_quantity <= 5 && product.stock_quantity > 0 && !compact && (
          <div className="absolute top-2 right-2 bg-orange-500/90 text-white text-xs px-2 py-0.5 rounded-full">
            Only {product.stock_quantity} left!
          </div>
        )}
        {product.stock_quantity === 0 && (
          <div className={`absolute inset-0 bg-black/60 flex items-center justify-center ${compact ? 'rounded-lg' : ''}`}>
            <span className="text-white font-semibold text-sm">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className={compact ? 'flex-1 min-w-0' : 'p-4'}>
        {!compact && product.store_name && (
          <p className="text-xs text-primary-400 font-medium mb-1 uppercase tracking-wide">
            {product.store_name}
          </p>
        )}
        <h3
          className={`font-semibold text-white group-hover:text-primary-400 transition-colors ${
            compact ? 'text-sm line-clamp-2' : 'text-base line-clamp-2'
          }`}
        >
          {product.name}
        </h3>
        {!compact && (
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className={`flex items-center justify-between ${compact ? 'mt-2' : 'mt-3'}`}>
          <span className={`font-bold text-white ${compact ? 'text-base' : 'text-xl'}`}>
            ${priceNum.toFixed(2)}
          </span>
          {!compact && (
            <div className="flex items-center gap-1 text-mall-gold text-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-slate-300">4.8</span>
            </div>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={product.stock_quantity === 0}
          className={`mt-3 w-full flex items-center justify-center gap-2 rounded-lg font-semibold text-sm transition-all active:scale-95 py-2 ${
            justAdded
              ? 'bg-green-600 text-white'
              : inCart
              ? 'bg-primary-700 text-white'
              : 'bg-primary-600 hover:bg-primary-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {justAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added!
            </>
          ) : inCart ? (
            <>
              <Check className="w-4 h-4" />
              In Cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {compact ? 'Add' : 'Add to Cart'}
            </>
          )}
        </button>
      </div>
    </Link>
  );
}

