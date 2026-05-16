import React, { useEffect, useState } from 'react';
import { getMyOrders, getWishlist, getCurrentUser } from '../services/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const user = getCurrentUser();
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    Promise.all([
      getMyOrders().catch(() => []),
      getWishlist().catch(() => [])
    ]).then(([o, w]) => {
      setOrders(o);
      setWishlist(w);
      setLoading(false);
    });
  }, []);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🔐</p>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Please Login First</h2>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">Login</Link>
          <Link to="/register" className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 font-medium">Register</Link>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  const statusColor = (s) => {
    const map = {
      delivered: 'bg-green-100 text-green-700',
      shipped: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    };
    return map[s] || 'bg-gray-100 text-gray-600';
  };

  const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-8 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-1">👋 Welcome, {user.name}!</h1>
            <p className="text-indigo-200">{user.email}</p>
          </div>
          <div className="flex gap-3">
            {user.is_admin && (
              <Link to="/admin" className="bg-white text-indigo-700 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-indigo-50 transition">
                🛠 Admin Panel
              </Link>
            )}
            <Link to="/" className="bg-white/20 text-white font-medium px-4 py-2 rounded-lg text-sm hover:bg-white/30 transition">
              🛒 Shop Now
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
          <p className="text-3xl font-bold text-indigo-600">{orders.length}</p>
          <p className="text-gray-500 mt-1 text-sm">Total Orders</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100">
          <p className="text-3xl font-bold text-pink-500">{wishlist.length}</p>
          <p className="text-gray-500 mt-1 text-sm">Wishlist Items</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm text-center border border-gray-100 col-span-2 md:col-span-1">
          <p className="text-3xl font-bold text-green-600">${totalSpent.toFixed(2)}</p>
          <p className="text-gray-500 mt-1 text-sm">Total Spent</p>
        </div>
      </div>

      {/* My Orders */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📦 My Orders</h2>
        {orders.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">🛒</p>
            <p className="font-medium mb-1">No orders yet</p>
            <Link to="/" className="text-indigo-600 hover:underline text-sm">Start shopping!</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-indigo-200 transition">
                <div>
                  <p className="font-semibold text-gray-700">Order #{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.items?.length || 0} item(s) • {order.address || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800 text-lg">${(order.total_amount || 0).toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wishlist */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">❤️ My Wishlist</h2>
        {wishlist.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No items in wishlist. Browse products and click ❤️ to save them!</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlist.map(item => {
              const img = item.product?.image;
              const imgSrc = img ? (img.startsWith('http') ? img : `http://localhost:8000${img}`) : null;
              return (
                <Link to={`/product/${item.product_id}`} key={item.id}
                  className="border border-gray-200 rounded-xl p-3 hover:border-indigo-400 hover:shadow transition">
                  {imgSrc && (
                    <img src={imgSrc} alt={item.product?.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                      onError={e => { e.target.style.display='none'; }} />
                  )}
                  <p className="font-medium text-sm text-gray-700 line-clamp-2">{item.product?.name}</p>
                  <p className="text-indigo-600 font-bold mt-1 text-sm">${item.product?.price}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
