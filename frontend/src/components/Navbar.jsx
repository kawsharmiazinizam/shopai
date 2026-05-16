import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { getCurrentUser, logout } from '../services/api';

export default function Navbar() {
  const { cartCount } = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  // Refresh user on route change (e.g., after login)
  useEffect(() => {
    setUser(getCurrentUser());
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-indigo-600 flex items-center gap-1">
            ⚡ ShopAI
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium transition ${location.pathname === '/' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
              Home
            </Link>
            {user?.is_admin && (
              <Link to="/admin" className={`text-sm font-medium transition ${location.pathname === '/admin' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
                🛠 Admin
              </Link>
            )}
            {user && (
              <Link to="/dashboard" className={`text-sm font-medium transition ${location.pathname === '/dashboard' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
                My Account
              </Link>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/cart" className="relative bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition flex items-center gap-1">
              🛒
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/dashboard" className="text-sm text-gray-700 font-medium hover:text-indigo-600 transition max-w-[120px] truncate">
                  👤 {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Link to="/login"
                  className="text-sm text-gray-600 border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition font-medium">
                  Login
                </Link>
                <Link to="/register"
                  className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition font-medium">
                  Register
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-gray-600 hover:text-indigo-600 p-1"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-3 pb-3 border-t border-gray-100 pt-3 space-y-2">
            <Link to="/" className="block text-sm text-gray-700 py-2 hover:text-indigo-600">🏠 Home</Link>
            {user?.is_admin && (
              <Link to="/admin" className="block text-sm text-gray-700 py-2 hover:text-indigo-600">🛠 Admin Panel</Link>
            )}
            {user ? (
              <>
                <Link to="/dashboard" className="block text-sm text-gray-700 py-2 hover:text-indigo-600">👤 {user.name}</Link>
                <button onClick={handleLogout} className="block text-sm text-red-500 py-2 w-full text-left">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-sm text-gray-700 py-2 hover:text-indigo-600">Login</Link>
                <Link to="/register" className="block text-sm text-gray-700 py-2 hover:text-indigo-600">Register</Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
