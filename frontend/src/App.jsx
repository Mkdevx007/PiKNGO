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
import { menuApi } from './services/api';
import { CartProvider } from './context/CartContext';
import CheckoutPage from './pages/CheckoutPage';
import './App.css';



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  // Handle Login State
  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserName(data.firstName || data.phoneNumber);
    setProfileImageUrl(data.profileImageUrl || '');
    localStorage.setItem('phone', data.phoneNumber);
    localStorage.setItem('userId', data.userId);
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
    setIsLoggedIn(false);
    setUserName('');
    setProfileImageUrl('');
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getProfile();
        setIsLoggedIn(true);
        setUserName(response.data.firstName || response.data.phoneNumber);
        setProfileImageUrl(response.data.profileImageUrl || '');
      } catch (err) {
        setIsLoggedIn(false);
        setUserName('');
        setProfileImageUrl('');
      }
    };
    checkAuth();
  }, []);

  return (
    <ThemeProvider>
      <CartProvider>
        <Router>
        <div className="app">
          <Navbar isLoggedIn={isLoggedIn} userName={userName} profileImageUrl={profileImageUrl} onLogout={handleLogout} />
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
