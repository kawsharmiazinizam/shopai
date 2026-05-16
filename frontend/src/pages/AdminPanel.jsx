import React, { useState, useEffect } from 'react';
import {
  adminGetProducts, adminAddProduct, adminDeleteProduct,
  getAllOrders, updateOrderStatus, getCategories, getCurrentUser
} from '../services/api';
import { Link } from 'react-router-dom';

const TABS = ['📦 Products', '➕ Add Product', '🧾 Orders'];

export default function AdminPanel() {
  const user = getCurrentUser();
  const [tab, setTab]           = useState('📦 Products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');
  const [form, setForm]         = useState({
    name: '', price: '', original_price: '', category_id: '',
    description: '', stock: '', brand: '', is_featured: false
  });

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    if (tab === '📦 Products') {
      adminGetProducts().then(setProducts).catch(() => {}).finally(() => setLoading(false));
    } else if (tab === '🧾 Orders') {
      getAllOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab]);

  // Not admin → redirect message
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🔐</p>
        <h2 className="text-xl font-bold text-gray-700 mb-4">Please login first</h2>
        <Link to="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">Login</Link>
      </div>
    </div>
  );

  if (!user.is_admin) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-5xl mb-4">🚫</p>
        <h2 className="text-xl font-bold text-gray-700 mb-2">Admin Access Only</h2>
        <p className="text-gray-500 mb-4">You don't have permission to view this page.</p>
        <Link to="/" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium">Back to Home</Link>
      </div>
    </div>
  );

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.category_id) { setMsg('❌ Please select a category'); return; }
    setMsg('');
    try {
      await adminAddProduct({
        name: form.name,
        price: parseFloat(form.price),
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category_id: parseInt(form.category_id),
        description: form.description,
        stock: parseInt(form.stock) || 0,
        brand: form.brand,
        is_featured: form.is_featured,
      });
      setMsg('✅ Product added successfully!');
      setForm({ name:'', price:'', original_price:'', category_id:'', description:'', stock:'', brand:'', is_featured: false });
      // Refresh products list
      adminGetProducts().then(setProducts).catch(() => {});
    } catch (err) {
      setMsg('❌ Failed: ' + (err.response?.data?.detail || 'Unknown error'));
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await adminDeleteProduct(id);
      setProducts(p => p.filter(x => x.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch { alert('Failed to update status'); }
  };

  const statusColor = (s) => {
    const map = { delivered: 'bg-green-100 text-green-700', shipped: 'bg-blue-100 text-blue-700', cancelled: 'bg-red-100 text-red-700', pending: 'bg-yellow-100 text-yellow-700' };
    return map[s] || 'bg-gray-100 text-gray-600';
  };

  // Stats
  const totalRevenue = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🛠 Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Logged in as <span className="font-medium text-indigo-600">{user.name}</span></p>
        </div>
        <Link to="/" className="text-sm text-indigo-600 hover:underline">← Back to Store</Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products', value: products.length, icon: '📦', color: 'text-indigo-600' },
          { label: 'Total Orders', value: orders.length, icon: '🧾', color: 'text-blue-600' },
          { label: 'Pending Orders', value: pendingOrders, icon: '⏳', color: 'text-yellow-600' },
          { label: 'Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: '💰', color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition
              ${tab === t ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-3"></div>
          Loading...
        </div>
      )}

      {/* ── Products List ── */}
      {!loading && tab === '📦 Products' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">All Products ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {['ID', 'Name', 'Category', 'Brand', 'Price', 'Stock', 'Featured', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-gray-400 font-mono">#{p.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-[180px]">
                      <Link to={`/product/${p.id}`} className="hover:text-indigo-600 line-clamp-1">{p.name}</Link>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{p.category?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{p.brand || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-600">${p.price}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${p.stock > 10 ? 'text-green-600' : p.stock > 0 ? 'text-orange-500' : 'text-red-500'}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">{p.is_featured ? '⭐' : '—'}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(p.id, p.name)}
                        className="text-red-500 hover:text-red-700 hover:underline text-xs font-medium">
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">No products found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add Product ── */}
      {!loading && tab === '➕ Add Product' && (
        <form onSubmit={handleAdd} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <h2 className="font-semibold text-gray-800 mb-5">Add New Product</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required
                placeholder="e.g. iPhone 15 Pro"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required
                placeholder="99.99"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price ($)</label>
              <input type="number" step="0.01" value={form.original_price} onChange={e => setForm({...form, original_price: e.target.value})}
                placeholder="129.99 (for discount)"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white">
                <option value="">— Select Category —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                placeholder="100"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input type="text" value={form.brand} onChange={e => setForm({...form, brand: e.target.value})}
                placeholder="Apple, Nike, Sony..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Product description..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div className="md:col-span-2 flex items-center gap-2">
              <input type="checkbox" id="featured" checked={form.is_featured}
                onChange={e => setForm({...form, is_featured: e.target.checked})}
                className="w-4 h-4 text-indigo-600 rounded" />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">⭐ Mark as Featured Product</label>
            </div>
          </div>

          {msg && (
            <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {msg}
            </div>
          )}

          <button type="submit"
            className="mt-5 w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition text-sm">
            ➕ Add Product
          </button>
        </form>
      )}

      {/* ── Orders ── */}
      {!loading && tab === '🧾 Orders' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">All Orders ({orders.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  {['Order ID', 'Date', 'Address', 'Phone', 'Total', 'Items', 'Status', 'Update'].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-mono text-gray-500">#{o.id}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{o.address || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{o.phone || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-600">${(o.total_amount || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-gray-500">{o.items?.length || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={o.status}
                        onChange={e => handleStatusChange(o.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400">
                        {['pending', 'shipped', 'delivered', 'cancelled'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-10 text-gray-400">No orders yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
