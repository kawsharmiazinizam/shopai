import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { getProduct, getRecommendations, generateDescription, getReviews, createReview, addToWishlist, removeFromWishlist, getWishlist, getCurrentUser } from '../services/api';

const resolveImage = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `http://localhost:8000${img}`;
};

const Stars = ({ rating, interactive = false, onRate }) => {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex gap-0.5">
      {[1,2,3,4,5].map(n => (
        <span key={n}
          className={`text-xl cursor-${interactive ? 'pointer' : 'default'} ${n <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'} transition`}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onRate && onRate(n)}>
          ★
        </span>
      ))}
    </span>
  );
};

export default function Product() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const user = getCurrentUser();

  const [product, setProduct]         = useState(null);
  const [recommendations, setRecs]    = useState([]);
  const [aiDesc, setAiDesc]           = useState('');
  const [loadingDesc, setLoadingDesc] = useState(false);
  const [added, setAdded]             = useState(false);
  const [reviews, setReviews]         = useState([]);
  const [myRating, setMyRating]       = useState(5);
  const [myComment, setMyComment]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [wishlisted, setWishlisted]   = useState(false);
  const [qty, setQty]                 = useState(1);
  const [tab, setTab]                 = useState('desc'); // desc | reviews | ai

  useEffect(() => {
    setProduct(null);
    getProduct(id).then(p => { setProduct(p); });
    getRecommendations(id).then(setRecs);
    getReviews(id).then(setReviews).catch(() => {});
    if (user) {
      getWishlist().then(wl => {
        setWishlisted(wl.some(w => w.product_id === parseInt(id)));
      }).catch(() => {});
    }
  }, [id]);

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleAIDesc = async () => {
    setLoadingDesc(true);
    try {
      const desc = await generateDescription(
        product.name,
        product.category?.name || '',
        product.brand || ''
      );
      setAiDesc(desc);
      setTab('ai');
    } catch { setAiDesc('AI service requires API key. Add ANTHROPIC_API_KEY to backend .env'); }
    finally { setLoadingDesc(false); }
  };

  const handleWishlist = async () => {
    if (!user) return alert('Please login to use wishlist');
    try {
      if (wishlisted) { await removeFromWishlist(id); setWishlisted(false); }
      else { await addToWishlist(id); setWishlisted(true); }
    } catch {}
  };

  const handleReview = async () => {
    if (!user) return alert('Please login to submit a review');
    setSubmitting(true);
    try {
      const r = await createReview({ product_id: parseInt(id), rating: myRating, comment: myComment });
      setReviews(prev => [r, ...prev]);
      setMyComment('');
    } catch (e) { alert('Could not submit review'); }
    finally { setSubmitting(false); }
  };

  if (!product) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading product...</p>
      </div>
    </div>
  );

  const imgSrc = resolveImage(product.image || product.image_url);
  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-indigo-600">Home</Link>
        <span>/</span>
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-gray-50 rounded-2xl flex items-center justify-center h-80 relative border border-gray-100">
          {imgSrc ? (
            <img src={imgSrc} alt={product.name} className="max-h-72 max-w-full object-contain p-4"
              onError={e => { e.target.style.display='none'; }} />
          ) : <span className="text-6xl">📦</span>}
          {discount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
              -{discount}% OFF
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-medium">
              {product.category?.name || 'General'}
            </span>
            {product.brand && <span className="text-xs text-gray-400">{product.brand}</span>}
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <Stars rating={product.rating} />
            <span className="text-sm text-gray-500">({product.review_count} reviews)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl text-indigo-600 font-bold">${product.price}</span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-gray-400 text-lg line-through">${product.original_price}</span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-600 font-medium">Qty:</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button onClick={() => setQty(q => Math.max(1, q-1))} className="px-3 py-2 hover:bg-gray-100 font-bold text-gray-600">−</button>
              <span className="px-4 py-2 font-semibold">{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock, q+1))} className="px-3 py-2 hover:bg-gray-100 font-bold text-gray-600">+</button>
            </div>
            <span className={`text-xs ${product.stock > 10 ? 'text-green-500' : product.stock > 0 ? 'text-orange-400' : 'text-red-400'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mb-4">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className={`flex-1 py-3 rounded-xl font-semibold text-white transition text-sm
                ${added ? 'bg-green-500' : product.stock === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'}`}>
              {added ? '✅ Added to Cart!' : `🛒 Add to Cart`}
            </button>
            <button onClick={handleWishlist}
              className={`px-4 py-3 rounded-xl border text-xl transition
                ${wishlisted ? 'border-red-300 text-red-500 bg-red-50' : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-400'}`}>
              {wishlisted ? '❤️' : '🤍'}
            </button>
          </div>

          <button onClick={handleAIDesc} disabled={loadingDesc}
            className="w-full py-2.5 rounded-xl border-2 border-indigo-400 text-indigo-600 font-medium hover:bg-indigo-50 transition text-sm">
            {loadingDesc ? '🤖 Generating AI Description...' : '✨ Generate AI Description'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-10">
        <div className="flex border-b border-gray-200 mb-6 gap-1">
          {[['desc','📋 Description'], ['reviews',`💬 Reviews (${reviews.length})`], ['ai','🤖 AI Description']].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition
                ${tab === key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Description Tab */}
        {tab === 'desc' && (
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p>{product.description || 'No description available.'}</p>
          </div>
        )}

        {/* AI Tab */}
        {tab === 'ai' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
            {aiDesc ? (
              <div>
                <h3 className="font-semibold text-indigo-700 mb-3">🤖 AI Generated Description</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{aiDesc}</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p className="text-4xl mb-2">🤖</p>
                <p>Click "Generate AI Description" to get an AI-powered product description</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {tab === 'reviews' && (
          <div>
            {/* Write Review */}
            {user ? (
              <div className="bg-gray-50 rounded-2xl p-5 mb-6 border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-3">Write a Review</h3>
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">Your Rating:</p>
                  <Stars rating={myRating} interactive onRate={setMyRating} />
                </div>
                <textarea
                  value={myComment}
                  onChange={e => setMyComment(e.target.value)}
                  rows={3}
                  placeholder="Share your thoughts about this product..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-3"
                />
                <button onClick={handleReview} disabled={submitting}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-700">
                <Link to="/login" className="font-semibold underline">Login</Link> to write a review
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {r.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span className="font-medium text-sm text-gray-800">{r.user?.name}</span>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                    {r.sentiment && (
                      <span className={`inline-block mt-2 text-xs px-2 py-0.5 rounded-full font-medium
                        ${r.sentiment === 'positive' ? 'bg-green-100 text-green-700' : r.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {r.sentiment === 'positive' ? '😊' : r.sentiment === 'negative' ? '😞' : '😐'} {r.sentiment}
                      </span>
                    )}
                    <p className="text-xs text-gray-400 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-5 text-gray-800">🤖 You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map(r => (
              <Link key={r.id} to={`/product/${r.id}`}
                className="bg-white rounded-xl shadow hover:shadow-md p-4 text-sm transition border border-gray-100 hover:border-indigo-200">
                {resolveImage(r.image) && (
                  <img src={resolveImage(r.image)} alt={r.name}
                    className="w-full h-28 object-cover rounded-lg mb-3"
                    onError={e => { e.target.style.display='none'; }} />
                )}
                <p className="font-semibold text-gray-800 line-clamp-2 mb-1">{r.name}</p>
                <p className="text-indigo-600 font-bold">${r.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
