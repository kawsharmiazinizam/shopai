import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { addToCart, clearBackendCart, placeOrder, getCurrentUser } from '../services/api';

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  const user = getCurrentUser();

  const [form, setForm] = useState({
    name:    user?.name  || '',
    email:   user?.email || '',
    address: '',
    city:    '',
    phone:   ''
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [step,    setStep]    = useState('');
  const [success, setSuccess] = useState(false);

  /* ── guards ── */
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-4xl mb-4">🔐</p>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Login required to checkout</h2>
        <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">Login</Link>
      </div>
    </div>
  );

  if (cart.length === 0 && !success) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Your cart is empty</h2>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">Shop Now</Link>
      </div>
    </div>
  );

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.address.trim() || !form.phone.trim()) {
      setError('Address and phone are required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // 1️⃣ Clear any stale backend cart first
      setStep('🧹 Preparing cart...');
      await clearBackendCart();

      // 2️⃣ Push every local cart item to backend
      setStep('🔄 Syncing items...');
      for (const item of cart) {
        await addToCart(item.id, item.quantity);
      }

      // 3️⃣ Place the order
      setStep('📦 Placing order...');
      const fullAddress = [form.address.trim(), form.city.trim()].filter(Boolean).join(', ');
      await placeOrder({ address: fullAddress, phone: form.phone.trim() });

      // 4️⃣ Success
      clearCart();          // wipe local/localStorage cart
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);

    } catch (err) {
      const detail = err.response?.data?.detail;
      if (typeof detail === 'string')      setError(detail);
      else if (Array.isArray(detail))      setError(detail.map(m => m.msg).join(', '));
      else                                 setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  /* ── success screen ── */
  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center bg-white rounded-2xl shadow-lg p-10 max-w-md mx-4">
        <div className="text-6xl mb-4 animate-bounce">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Order Placed!</h2>
        <p className="text-gray-600 mb-2">
          Thank you, <strong>{user.name}</strong>!
        </p>
        <p className="text-gray-500 text-sm mb-6">Redirecting to your dashboard…</p>
        <Link to="/dashboard"
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 font-medium">
          View My Orders →
        </Link>
      </div>
    </div>
  );

  /* ── main form ── */
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Link to="/cart" className="text-gray-400 hover:text-indigo-600 text-sm">← Back to Cart</Link>
        <span className="text-gray-200">|</span>
        <h1 className="text-2xl font-bold text-gray-900">📦 Checkout</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">

        {/* ── Shipping form ── */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-bold text-gray-800 mb-5 text-lg">Shipping Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input name="name" value={form.name} onChange={handleChange} required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required
                    placeholder="+880 1234 567890"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input name="email" value={form.email} onChange={handleChange} type="email"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                <input name="address" value={form.address} onChange={handleChange} required
                  placeholder="House 12, Road 5, Block B"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City / Area</label>
                <input name="city" value={form.city} onChange={handleChange}
                  placeholder="Dhaka, Chittagong…"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200 flex items-start gap-2">
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              {/* Progress */}
              {loading && step && (
                <div className="bg-indigo-50 text-indigo-600 text-sm px-4 py-3 rounded-lg border border-indigo-200 flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 shrink-0"></div>
                  <span>{step}</span>
                </div>
              )}

              <button type="submit" disabled={loading}
                className={`w-full py-3.5 rounded-xl font-semibold text-white transition text-sm mt-2
                  ${loading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}>
                {loading ? (step || 'Processing…') : `✅ Place Order — $${cartTotal.toFixed(2)}`}
              </button>
            </form>
          </div>
        </div>

        {/* ── Order summary ── */}
        <div className="md:col-span-2">
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 sticky top-24">
            <h2 className="font-bold text-gray-800 mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {cart.map(i => (
                <div key={i.id} className="flex justify-between text-sm text-gray-600 gap-2">
                  <span className="line-clamp-2 flex-1">
                    {i.name}
                    <span className="text-gray-400 ml-1">×{i.quantity}</span>
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    ${(i.price * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-200 mt-2">
                <span>Total</span>
                <span className="text-indigo-600 text-lg">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
