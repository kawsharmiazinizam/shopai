
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import CartItem from '../components/CartItem';

export default function Cart() {
  const { cart, clearCart, cartTotal } = useContext(CartContext);

  if (cart.length === 0)
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🛒</p>
        <p className="text-xl text-gray-500">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
          Shop Now
        </Link>
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">🛒 Your Cart</h1>
      <div className="space-y-4">
        {cart.map(item => <CartItem key={item.id} item={item} />)}
      </div>

      <div className="mt-8 bg-white rounded-2xl shadow p-6">
        <div className="flex justify-between text-lg font-semibold mb-4">
          <span>Total</span>
          <span className="text-indigo-600">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-3">
          <button onClick={clearCart}
            className="flex-1 py-2.5 border border-red-300 text-red-500 rounded-xl hover:bg-red-50 transition">
            Clear Cart
          </button>
          <Link to="/checkout"
            className="flex-1 text-center py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
