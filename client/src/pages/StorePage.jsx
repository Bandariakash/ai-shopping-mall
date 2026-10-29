import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Search, Store } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { fetchStoreById, fetchProducts } from '../utils/api';

export default function StorePage() {
  const { storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [storeData, productsData] = await Promise.all([
          fetchStoreById(storeId),
          fetchProducts({ storeId, limit: 50 }),
        ]);
        setStore(storeData.store);
        setProducts(productsData.products || []);
      } catch (err) {
        console.error('Failed to load store:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [storeId]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      const data = await fetchProducts({ storeId, limit: 50 });
      setProducts(data.products || []);
      return;
    }
    setSearching(true);
    try {
      const data = await fetchProducts({ storeId, search: query });
      setProducts(data.products || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const categoryGradients = {
    'Electronics & Tech': 'from-blue-600 to-cyan-500',
    'Fashion & Apparel': 'from-pink-600 to-rose-500',
    'Home & Living': 'from-green-600 to-emerald-500',
    'Entertainment & Toys': 'from-purple-600 to-violet-500',
  };

  const categoryIcons = {
    'Electronics & Tech': '💻',
    'Fashion & Apparel': '👗',
    'Home & Living': '🏠',
    'Entertainment & Toys': '🎮',
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-56 bg-slate-800 rounded-2xl mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="card h-72">
                <div className="h-44 bg-slate-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Store className="w-16 h-16 text-slate-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Store Not Found</h2>
        <p className="text-slate-400 mb-6">This store doesn't exist or has been removed.</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Mall
        </Link>
      </div>
    );
  }

  const gradient = categoryGradients[store.category] || 'from-primary-600 to-primary-500';
  const icon = categoryIcons[store.category] || '🏪';

  return (
    <div className="min-h-screen">
      {/* Store Banner */}
      <div className={`relative h-56 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {store.image_url && (
          <img
            src={store.image_url}
            alt={store.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-6">
          <Link
            to="/"
            className="absolute top-4 left-4 sm:left-6 lg:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="w-4 h-4" /> Mall Directory
          </Link>
          <div className="flex items-end gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl border border-white/30">
              {icon}
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium">{store.category}</p>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{store.name}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Description & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <p className="text-slate-400 max-w-xl">{store.description}</p>
          <div className="relative flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                handleSearch(e.target.value);
              }}
              placeholder="Search in this store..."
              className="input-field pl-10 text-sm w-64"
            />
          </div>
        </div>

        {/* Products Grid */}
        {searching ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-2 text-slate-400">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Searching...
            </div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 card">
            <Package className="w-14 h-14 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Products Found</h3>
            <p className="text-slate-400">Try a different search term or browse other stores.</p>
          </div>
        ) : (
          <>
            <p className="text-slate-400 text-sm mb-4">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

