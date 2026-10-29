import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package } from 'lucide-react';

const categoryIcons = {
  'Electronics & Tech': '💻',
  'Fashion & Apparel': '👗',
  'Home & Living': '🏠',
  'Entertainment & Toys': '🎮',
};

const categoryGradients = {
  'Electronics & Tech': 'from-blue-600 to-cyan-500',
  'Fashion & Apparel': 'from-pink-600 to-rose-500',
  'Home & Living': 'from-green-600 to-emerald-500',
  'Entertainment & Toys': 'from-purple-600 to-violet-500',
};

export default function StoreCard({ store }) {
  const icon = categoryIcons[store.category] || '🏪';
  const gradient = categoryGradients[store.category] || 'from-primary-600 to-primary-500';

  return (
    <Link
      to={`/store/${store.id}`}
      className="card group hover:border-primary-500 hover:-translate-y-1 transition-all duration-300 block"
    >
      {/* Store Image / Banner */}
      <div className={`relative h-48 bg-gradient-to-br ${gradient} overflow-hidden`}>
        {store.image_url ? (
          <img
            src={store.image_url}
            alt={store.name}
            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-500"
          />
        ) : null}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-5xl">{icon}</span>
          </div>
        </div>
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full border border-white/20">
            {store.category}
          </span>
        </div>
      </div>

      {/* Store Info */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
          {store.name}
        </h3>
        <p className="text-sm text-slate-400 mt-1 line-clamp-2">
          {store.description}
        </p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 text-slate-400 text-sm">
            <Package className="w-4 h-4" />
            <span>{store.product_count || 0} products</span>
          </div>
          <div className="flex items-center gap-1 text-primary-400 text-sm font-medium group-hover:gap-2 transition-all">
            <span>Browse</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

