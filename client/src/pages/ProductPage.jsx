import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Check, Store, Star, Package, Shield, Truck } from 'lucide-react';
import { fetchProductById } from '../utils/api';
import { useCart } from '../context/CartContext';

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addToCart, isInCart } = useCart();

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(productId);
        setProduct(data.product);
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-5 bg-slate-700 rounded w-40 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-800 rounded-2xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-700 rounded w-3/4" />
              <div className="h-5 bg-slate-700 rounded w-1/2" />
              <div className="h-12 bg-slate-700 rounded w-1/3" />
              <div className="h-4 bg-slate-700 rounded" />
              <div className="h-4 bg-slate-700 rounded w-5/6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <Package className="w-16 h-16 text-slate-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
        <Link to="/" className="btn-primary inline-flex items-center gap-2 mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Mall
        </Link>
      </div>
    );
  }

  const price = parseFloat(product.price);
  const inCart = isInCart(product.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/" className="hover:text-white transition-colors">Mall</Link>
        <span>/</span>
        <Link to={`/store/${product.store_id}`} className="hover:text-white transition-colors">
          {product.store_name}
        </Link>
        <span>/</span>
        <span className="text-white truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="relative">
          <div className="aspect-square bg-slate-800 rounded-2xl overflow-hidden border border-slate-700">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-24 h-24 text-slate-500" />
              </div>
            )}
          </div>
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm px-3 py-1 rounded-full font-medium">
              Only {product.stock_quantity} left!
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-5">
          {/* Store Link */}
          <Link
            to={`/store/${product.store_id}`}
            className="inline-flex items-center gap-1.5 text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            <Store className="w-4 h-4" />
            {product.store_name}
          </Link>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
            {product.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 5 ? 'text-mall-gold fill-current' : 'text-slate-600'}`} />
              ))}
            </div>
            <span className="text-slate-400 text-sm">(128 reviews)</span>
            <span className="text-slate-600">•</span>
            <span className={`text-sm font-medium ${product.stock_quantity > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {product.stock_quantity > 0 ? `In Stock (${product.stock_quantity})` : 'Out of Stock'}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-white">${price.toFixed(2)}</span>
            <span className="text-slate-400 text-sm">Free shipping</span>
          </div>

          {/* Description */}
          <p className="text-slate-300 leading-relaxed">{product.description}</p>

          {/* Category */}
          <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-full px-3 py-1.5">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Category</span>
            <span className="text-xs text-white font-semibold">{product.store_category}</span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm font-medium">Quantity</span>
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-1 py-1">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-lg font-bold"
              >
                −
              </button>
              <span className="w-10 text-center text-white font-semibold text-lg">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                disabled={quantity >= product.stock_quantity}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-lg font-bold disabled:opacity-40"
              >
                +
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-lg transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
              justAdded
                ? 'bg-green-600 text-white shadow-green-500/20'
                : 'bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white shadow-primary-500/20'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-6 h-6" />
                Added to Cart!
              </>
            ) : (
              <>
                <ShoppingCart className="w-6 h-6" />
                {inCart ? 'Add More to Cart' : 'Add to Cart'}
              </>
            )}
          </button>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 bg-slate-800/50 border border-slate-700 rounded-xl p-3">
              <Truck className="w-5 h-5 text-primary-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Free Shipping</p>
                <p className="text-xs text-slate-400">On all orders</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-800/50 border border-slate-700 rounded-xl p-3">
              <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Secure Checkout</p>
                <p className="text-xs text-slate-400">256-bit encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

