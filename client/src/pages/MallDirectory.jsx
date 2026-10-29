import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Store, Search, Sparkles, ChevronRight } from 'lucide-react';
import StoreCard from '../components/StoreCard';
import ProductCard from '../components/ProductCard';
import { fetchStores, fetchProducts } from '../utils/api';

const CATEGORIES = [
  { label: 'All Stores', value: '' },
  { label: 'Electronics & Tech', value: 'Electronics & Tech', icon: '💻' },
  { label: 'Fashion & Apparel', value: 'Fashion & Apparel', icon: '👗' },
  { label: 'Home & Living', value: 'Home & Living', icon: '🏠' },
  { label: 'Entertainment & Toys', value: 'Entertainment & Toys', icon: '🎮' },
];

export default function MallDirectory() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [stores, setStores] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Fetch stores
  useEffect(() => {
    const loadStores = async () => {
      try {
        setLoading(true);
        const data = await fetchStores(activeCategory ? { category: activeCategory } : {});
        setStores(data.stores || []);
      } catch (err) {
        console.error('Failed to load stores:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStores();
  }, [activeCategory]);

  // Search products when query changes
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }
    const doSearch = async () => {
      setSearching(true);
      try {
        const data = await fetchProducts({ search: searchQuery, limit: 12 });
        setSearchResults(data.products || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    };
    doSearch();
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ search: localSearch.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setLocalSearch('');
    setSearchParams({});
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-slate-900 via-primary-900/30 to-slate-900 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-500/10 border border-primary-500/30 text-primary-400 text-sm px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Shopping Experience
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">
            Welcome to{' '}
            <span className="text-gradient">AI Mall</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Browse hundreds of products across premium stores, or let our AI Concierge 
            find exactly what you're looking for — instantly.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto">
            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="Search all products across the mall..."
                  className="w-full bg-slate-800/80 border border-slate-600 rounded-xl pl-12 pr-4 py-3.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
              <button type="submit" className="btn-primary px-6 rounded-xl">
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-10 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Search Results for "{searchQuery}"
                </h2>
                {!searching && (
                  <p className="text-slate-400 text-sm mt-1">
                    Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <button onClick={clearSearch} className="text-sm text-primary-400 hover:text-primary-300">
                Clear Search
              </button>
            </div>

            {searching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="card h-72 animate-pulse">
                    <div className="h-44 bg-slate-700" />
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-slate-700 rounded w-3/4" />
                      <div className="h-3 bg-slate-700 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 card">
                <Search className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-white font-semibold">No products found</p>
                <p className="text-slate-400 text-sm mt-1">
                  Try the AI Concierge for personalized recommendations!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Store Directory */}
        <div>
          {/* Category Filters */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary-400" />
              <h2 className="text-2xl font-bold text-white">Mall Directory</h2>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.value
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
                }`}
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>

          {/* Store Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-48 bg-slate-700" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-slate-700 rounded w-2/3" />
                    <div className="h-4 bg-slate-700 rounded" />
                    <div className="h-4 bg-slate-700 rounded w-4/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}
        </div>

        {/* AI CTA Banner */}
        <div className="mt-14 bg-gradient-to-r from-primary-900/50 to-purple-900/50 border border-primary-700/50 rounded-2xl p-8 text-center">
          <Sparkles className="w-10 h-10 text-primary-400 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-white mb-2">
            Can't find what you're looking for?
          </h3>
          <p className="text-slate-400 mb-5 max-w-lg mx-auto">
            Our AI Concierge knows every product in the mall. Just describe what you need — 
            gift ideas, budget constraints, preferences — and get instant, personalized recommendations.
          </p>
          <div className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95">
            <Sparkles className="w-4 h-4" />
            Chat with AI Concierge
            <ChevronRight className="w-4 h-4" />
          </div>
          <p className="text-xs text-slate-500 mt-3">Click the floating button in the bottom-right corner</p>
        </div>
      </div>
    </div>
  );
}

