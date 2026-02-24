/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Heart, Users, MessageCircle, User as UserIcon, LogOut, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { User } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import Discover from './pages/Discover';
import Friends from './pages/Friends';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        
        <main className={cn("max-w-4xl mx-auto px-4 py-6 pb-24", !user && "py-0 px-0 max-w-none")}>
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} />
            
            <Route path="/" element={user ? <Discover currentUser={user} /> : <Navigate to="/login" />} />
            <Route path="/friends" element={user ? <Friends currentUser={user} /> : <Navigate to="/login" />} />
            <Route path="/chat/:friendId" element={user ? <Chat currentUser={user} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={user ? <Profile currentUser={user} onUpdate={handleLogin} /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {user && <MobileNav />}
      </div>
    </Router>
  );
}

function Navbar({ user, onLogout }: { user: User; onLogout: () => void }) {
  return (
    <nav className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-stone-200 sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-2 text-rose-600 font-bold text-2xl tracking-tight">
        <Heart className="fill-current" />
        <span>Love2CunaLove</span>
      </Link>
      
      <div className="flex items-center gap-8">
        <NavLink to="/" icon={<Search size={20} />} label="Descobrir" />
        <NavLink to="/friends" icon={<Users size={20} />} label="Amigos" />
        <NavLink to="/profile" icon={<UserIcon size={20} />} label="Perfil" />
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-stone-500 hover:text-rose-600 transition-colors"
        >
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex items-center gap-2 text-stone-600 hover:text-rose-600 transition-colors font-medium">
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex justify-between items-center z-50">
      <MobileNavLink to="/" icon={<Search size={24} />} />
      <MobileNavLink to="/friends" icon={<Users size={24} />} />
      <MobileNavLink to="/profile" icon={<UserIcon size={24} />} />
    </nav>
  );
}

function MobileNavLink({ to, icon }: { to: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="p-2 text-stone-400 hover:text-rose-600 transition-colors">
      {icon}
    </Link>
  );
}

