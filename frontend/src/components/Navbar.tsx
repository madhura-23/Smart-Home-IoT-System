import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🏠 Smart Home IoT
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:text-blue-200">Dashboard</Link>
          <Link to="/devices" className="hover:text-blue-200">Devices</Link>
          <Link to="/rooms" className="hover:text-blue-200">Rooms</Link>

          <div className="flex items-center gap-4 border-l pl-4">
            <span className="text-sm">
              {user?.firstName} {user?.lastName}
            </span>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
