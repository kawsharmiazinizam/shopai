import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export default function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useContext(CartContext);

  return (
    <div className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
      {/* Image / Emoji */}
      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        {item.image_url
          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover rounded-lg" />
          : <span className="text-3xl">{item.emoji || '📦'}</span>
        }
      </div>

      {/* Info */}
      <div className="flex-grow">
        <h3 className="font-semibold text-gray-800">{item.name}</h3>
        <p className="text-indigo-600 font-bold">${item.price}</p>
      </div>

      {/* Quantity */}
      <div className="flex items-center gap-2">
        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition">−</button>
        <span className="w-6 text-center font-semibold">{item.quantity}</span>
        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition">+</button>
      </div>

      {/* Subtotal */}
      <p className="font-bold text-gray-800 w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>

      {/* Remove */}
      <button onClick={() => removeFromCart(item.id)}
        className="text-red-400 hover:text-red-600 transition text-xl ml-2">✕</button>
    </div>
  );
}
