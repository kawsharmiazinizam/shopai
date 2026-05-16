import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

// Helper: resolve image URL (backend returns /uploads/... or external URL)
const resolveImage = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `http://localhost:8000${img}`;
};

// Star rating display
const Stars = ({ rating }) => {
  const full = Math.floor(rating || 0);
  const half = (rating || 0) % 1 >= 0.5;
  return (
    <span className="text-yellow-400 text-xs">
      {'★'.repeat(full)}{half ? '½' : ''}{'☆'.repeat(5 - full - (half ? 1 : 0))}
      <span className="text-gray-400 ml-1">{(rating || 0).toFixed(1)}</span>
    </span>
  );
};

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const imgSrc = resolveImage(product.image || product.image_url);
  const categoryName = product.category?.name || product.category || '';
  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <div className="bg-white rounded-2xl shadow hover:shadow-lg transition overflow-hidden group border border-gray-100">
      {/* Image */}
      <Link to={`/product/${product.id}`}>
        <div className="h-48 bg-gray-50 flex items-center justify-center overflow-hidden relative">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
              onError={e => { e.target.style.display = 'none'; }}
            />
          ) : (
            <span className="text-5xl">📦</span>
          )}
          {discount && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.is_featured && (
            <span className="absolute top-2 right-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
              ⭐ Featured
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        {categoryName && (
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium capitalize">
            {categoryName}
          </span>
        )}
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-gray-800 mt-2 mb-1 hover:text-indigo-600 transition line-clamp-2 text-sm">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
        )}

        <Stars rating={product.rating} />

        <div className="flex items-center gap-2 mt-2">
          <span className="text-indigo-600 font-bold text-lg">${product.price}</span>
          {product.original_price && product.original_price > product.price && (
            <span className="text-gray-400 text-sm line-through">${product.original_price}</span>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 gap-2">
          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition
              ${product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}`}
          >
            {product.stock === 0 ? 'Out of Stock' : '🛒 Add to Cart'}
          </button>
        </div>

        <p className={`text-xs mt-2 ${product.stock > 10 ? 'text-green-500' : product.stock > 0 ? 'text-orange-400' : 'text-red-400'}`}>
          {product.stock > 10 ? `✅ In Stock` : product.stock > 0 ? `⚠️ Only ${product.stock} left` : '❌ Out of Stock'}
        </p>
      </div>
    </div>
  );
}
