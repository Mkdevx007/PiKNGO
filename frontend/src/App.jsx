import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AboutPage from './pages/AboutPage';
import ProfileScreen from './pages/ProfileScreen';
import Dashboard from './pages/Dashboard';
import TrendingPage from './pages/TrendingPage';
import MenuPage from './pages/MenuPage';
import ManageRestaurants from './pages/ManageRestaurants';
import OrdersPage from './pages/OrdersPage';
import ManageMenu from './pages/ManageMenu';
import ManageUsers from './pages/ManageUsers';
import { authApi } from './services/api';
import { CartProvider } from './context/CartContext';
import CheckoutPage from './pages/CheckoutPage';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'USER');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  // Handle Login State
  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserName(data.firstName || data.phoneNumber);
    setProfileImageUrl(data.profileImageUrl || '');
    setUserRole(data.role || 'USER');
    localStorage.setItem('phone', data.phoneNumber);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userRole', data.role || 'USER');
  };

  // Logout logic
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error("Logout failed on server", err);
    }
    localStorage.removeItem('phone');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    setIsLoggedIn(false);
    setUserName('');
    setProfileImageUrl('');
    setUserRole('USER');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getProfile();
        setIsLoggedIn(true);
        setUserName(response.data.firstName || response.data.phoneNumber);
        setProfileImageUrl(response.data.profileImageUrl || '');
        setUserRole(response.data.role || 'USER');
      } catch (err) {
        setIsLoggedIn(false);
        setUserName('');
        setProfileImageUrl('');
        setUserRole('USER');
      }
    };
    checkAuth();
  }, []);

  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
        <div className="app">
          <Navbar 
            isLoggedIn={isLoggedIn} 
            userName={userName} 
            userRole={userRole}
            profileImageUrl={profileImageUrl} 
            onLogout={handleLogout} 
          />
          <main>
            <Routes>
              <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LandingPage isLoggedIn={isLoggedIn} />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
              <Route path="/register" element={<AuthPage onLogin={handleLogin} />} />
              <Route path="/profile" element={isLoggedIn ? <ProfileScreen onProfileUpdate={(data) => setProfileImageUrl(data.profileImageUrl)} /> : <Navigate to="/login" />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/menu/:restaurantId" element={<MenuPage />} />
              <Route path="/checkout" element={isLoggedIn ? <CheckoutPage /> : <Navigate to="/login" />} />
              <Route path="/orders" element={isLoggedIn ? <OrdersPage /> : <Navigate to="/login" />} />
              <Route path="/admin/restaurants" element={isLoggedIn && userRole === 'ADMIN' ? <ManageRestaurants /> : <Navigate to="/" />} />
              <Route path="/admin/users" element={isLoggedIn && userRole === 'ADMIN' ? <ManageUsers /> : <Navigate to="/" />} />
              <Route path="/admin/menu/:restaurantId" element={isLoggedIn && userRole === 'ADMIN' ? <ManageMenu /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
        </Router>
      </CartProvider>
    </ThemeProvider>
  );
}

export default App;
