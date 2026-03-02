import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold flex items-center gap-2 hover:text-blue-200 transition">
            <span>🏠</span>
            <span>Smart Home IoT</span>
          </Link>

          <div className="flex items-center gap-8">
            <Link 
              to="/" 
              className={`hover:text-blue-200 transition font-medium ${isActive('/') ? 'border-b-2 border-white' : ''}`}
            >
              Dashboard
            </Link>
            <Link 
              to="/devices" 
              className={`hover:text-blue-200 transition font-medium ${isActive('/devices') ? 'border-b-2 border-white' : ''}`}
            >
              Devices
            </Link>
            <Link 
              to="/rooms" 
              className={`hover:text-blue-200 transition font-medium ${isActive('/rooms') ? 'border-b-2 border-white' : ''}`}
            >
              Rooms
            </Link>

            <div className="flex items-center gap-4 border-l border-blue-400 pl-6">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-blue-200">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition font-medium shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
