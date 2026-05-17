import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';

export default function Home() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery]           = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [loading, setLoading]       = useState(true);
  const [featured, setFeatured]     = useState(false);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [categoryId, featured]);

  const [retryCount, setRetryCount] = useState(0);

  // Auto-retry if no products (backend waking up)
  useEffect(() => {
    if (!loading && products.length === 0 && retryCount < 5) {
      const timer = setTimeout(() => {
        setRetryCount(r => r + 1);
        fetchProducts();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [loading, products.length, retryCount]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (categoryId) params.category_id = categoryId;
      if (featured) params.featured = true;
      if (query.trim()) params.search = query.trim();
      const data = await getProducts(params);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const catEmojis = { Electronics: 'ðŸ“±', Fashion: 'ðŸ‘—', 'Home & Garden': 'ðŸ¡', Sports: 'âš½', Books: 'ðŸ“š', Beauty: 'ðŸ’„' };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-10 mb-10 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 text-[200px] flex items-center justify-center pointer-events-none select-none">ðŸ›’</div>
        <h1 className="text-4xl font-bold mb-3 relative">âš¡ ShopAI Store</h1>
        <p className="text-lg opacity-90 relative">Smart shopping powered by AI â€” find the best products instantly</p>
        <div className="flex flex-wrap justify-center gap-4 mt-6 relative">
          <span className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium">ðŸ¤– AI Chatbot</span>
          <span className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium">âœ¨ Smart Search</span>
          <span className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium">â¤ï¸ Wishlist</span>
          <span className="bg-white/20 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium">ðŸ“¦ Fast Delivery</span>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ðŸ” Search products... (e.g. iPhone, Nike, Book)"
          className="flex-grow border border-gray-300 rounded-xl px-5 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700 shadow-sm"
        />
        <button type="submit"
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition font-semibold shadow-sm">
          Search
        </button>
        {query && (
          <button type="button" onClick={() => { setQuery(''); setTimeout(fetchProducts, 0); }}
            className="text-gray-400 hover:text-red-500 px-3 py-3 rounded-xl border border-gray-200 hover:border-red-200 transition">
            âœ•
          </button>
        )}
      </form>

      {/* Categories */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => { setCategoryId(null); setFeatured(false); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition border
            ${!categoryId && !featured ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
          ðŸª All Products
        </button>
        <button
          onClick={() => { setCategoryId(null); setFeatured(true); }}
          className={`px-4 py-2 rounded-full text-sm font-medium transition border
            ${featured ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-gray-700 border-gray-200 hover:border-amber-300 hover:text-amber-600'}`}>
          â­ Featured
        </button>
        {categories.map(cat => (
          <button key={cat.id}
            onClick={() => { setCategoryId(cat.id); setFeatured(false); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition border
              ${categoryId === cat.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-700 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'}`}>
            {catEmojis[cat.name] || 'ðŸ“¦'} {cat.name}
          </button>
        ))}
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {loading ? '⏳ Loading products...' : `${products.length} products found`}
        </p>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded mt-3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">ðŸ”</p>
          <p className="text-xl text-gray-500 mb-2">No products found</p>
          <p className="text-sm text-gray-400">Try a different search or category</p>
          <button onClick={() => { setQuery(''); setCategoryId(null); setFeatured(false); }}
            className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}


