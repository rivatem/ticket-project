import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, User, LogOut, Search, Menu, X } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Ticket className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-zinc-900 tracking-tight">EventTix</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-zinc-600 hover:text-indigo-600 font-medium transition-colors">Explore</Link>
            {user ? (
              <>
                <Link to="/my-tickets" className="text-zinc-600 hover:text-indigo-600 font-medium transition-colors">My Tickets</Link>
                <Link to="/scanner" className="text-zinc-600 hover:text-indigo-600 font-medium transition-colors">Scanner</Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-zinc-600 hover:text-indigo-600 font-medium transition-colors">Admin</Link>
                )}
                <Link to="/create-event" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm">Create Event</Link>
                <div className="flex items-center space-x-4 pl-4 border-l border-zinc-200">
                  <span className="text-sm font-medium text-zinc-700">{user.name}</span>
                  <button onClick={logout} className="text-zinc-400 hover:text-red-500 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-zinc-600 hover:text-indigo-600 font-medium">Login</Link>
                <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-all shadow-sm">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-zinc-100 py-4 px-4 space-y-4">
          <Link to="/" className="block text-zinc-600 font-medium">Explore</Link>
          {user ? (
            <>
              <Link to="/my-tickets" className="block text-zinc-600 font-medium">My Tickets</Link>
              <Link to="/scanner" className="block text-zinc-600 font-medium">Scanner</Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="block text-zinc-600 font-medium">Admin</Link>
              )}
              <Link to="/create-event" className="block text-indigo-600 font-medium">Create Event</Link>
              <button onClick={logout} className="block text-red-500 font-medium">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="block text-zinc-600 font-medium">Login</Link>
              <Link to="/register" className="block text-indigo-600 font-medium">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};
