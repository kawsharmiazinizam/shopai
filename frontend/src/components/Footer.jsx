import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">⚡ ShopAI</h3>
          <p className="text-sm">AI-powered e-commerce platform. Smart shopping for everyone.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
            <li><Link to="/cart" className="hover:text-white transition">Cart</Link></li>
            <li><Link to="/admin" className="hover:text-white transition">Admin Panel</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <p className="text-sm">support@shopai.com</p>
          <p className="text-sm mt-1">Dhaka, Bangladesh</p>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-xs">
        © 2025 ShopAI. Built with ❤️ and Claude AI.
      </div>
    </footer>
  );
}
