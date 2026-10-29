import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import CartModal from './components/CartModal';
import AIChatWidget from './components/AIChatWidget';
import MallDirectory from './pages/MallDirectory';
import StorePage from './pages/StorePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';

function AppContent() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-mall-dark">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <main>
        <Routes>
          <Route path="/" element={<MallDirectory />} />
          <Route path="/store/:storeId" element={<StorePage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © 2024 AI Shopping Mall · Powered by Groq AI · Built with ❤️
          </p>
        </div>
      </footer>

      {/* Global Cart Modal */}
      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />

      {/* AI Chat Widget - Floating, always visible */}
      <AIChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

