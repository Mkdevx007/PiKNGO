import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import AdminDashboard from './pages/AdminDashboard';
import GlobalOrders from './pages/GlobalOrders';
import GlobalSettings from './pages/GlobalSettings';
import Promotions from './pages/Promotions';
import AdminLayout from './components/AdminLayout/AdminLayout';
import Footer from './components/Footer/Footer';
import VaultPage from './pages/VaultPage';
import { authApi } from './services/api';
import { CartProvider } from './context/CartContext';
import CheckoutPage from './pages/CheckoutPage';
import './App.css';

import { ToastProvider } from './context/ToastContext';

import ActiveOrderBar from './components/ActiveOrderBar/ActiveOrderBar';
import MobileNav from './components/MobileNav/MobileNav';

// Inner component to use hooks inside Router context
function AppContent({ isLoggedIn, userName, userRole, profileImageUrl, handleLogin, handleLogout }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const shouldHideGlobalComponents = isAdminRoute || isAuthRoute;

  return (
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
          <Route path="/vault" element={isLoggedIn ? <VaultPage /> : <Navigate to="/login" />} />

          {/* Admin Routes wrapped in AdminLayout */}
          <Route path="/admin/*" element={
            isLoggedIn && userRole === 'ADMIN' ? (
              <AdminLayout>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="restaurants" element={<ManageRestaurants />} />
                  <Route path="all-orders" element={<GlobalOrders />} />
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="settings" element={<GlobalSettings />} />
                  <Route path="promotions" element={<Promotions />} />
                  <Route path="menu/:restaurantId" element={<ManageMenu />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </AdminLayout>
            ) : <Navigate to="/" />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      {/* Footer aur ActiveOrderBar sirf non-admin aur non-auth pages pe render honge */}
      {!shouldHideGlobalComponents && <Footer />}
      {!shouldHideGlobalComponents && <ActiveOrderBar />}
      {!shouldHideGlobalComponents && <MobileNav />}
    </div>
  );
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userId'));
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || 'USER');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Handle Login State
  const handleLogin = async (data) => {
    setIsLoggedIn(true);
    setUserName(data.firstName || data.phoneNumber);
    setProfileImageUrl(data.profileImageUrl || '');
    setUserRole(data.role || 'USER');
    localStorage.setItem('phone', data.phoneNumber);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userRole', data.role || 'USER');

    // Fetch full profile immediately to get firstName/avatar if not in JwtResponse
    try {
      const response = await authApi.getProfile();
      const fullData = response.data || response;
      setUserName(fullData.firstName || fullData.phoneNumber);
      setProfileImageUrl(fullData.profileImageUrl || '');
    } catch (err) {
      console.warn("Failed to fetch full profile after login", err);
    }
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
      // If we don't even have a userId in localStorage, we can skip the profile check
      // unless we want to rely strictly on the HttpOnly cookie.
      if (!localStorage.getItem('userId')) {
        setIsLoggedIn(false);
        setAuthLoading(false);
        return;
      }

      try {
        const response = await authApi.getProfile();
        const data = response.data || response;
        setIsLoggedIn(true);
        setUserName(data.firstName || data.phoneNumber);
        setProfileImageUrl(data.profileImageUrl || '');
        setUserRole(data.role || 'USER');
      } catch (err) {
        // If profile check fails, the user is definitely not logged in or session expired
        setIsLoggedIn(false);
        setUserName('');
        setProfileImageUrl('');
        setUserRole('USER');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (authLoading) {
    return (
      <div className="elite-app-loader">
        <div className="loader-orbit">
          <div className="orbit-item"></div>
          <div className="orbit-item"></div>
        </div>
        <p>Loading PikNGo Experience...</p>
      </div>
    );
  }

  return (
    <ToastProvider>
      <ThemeProvider>
        <CartProvider>
          <Router>
            <AppContent
              isLoggedIn={isLoggedIn}
              userName={userName}
              userRole={userRole}
              profileImageUrl={profileImageUrl}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
            />
          </Router>
        </CartProvider>
      </ThemeProvider>
    </ToastProvider>
  );
}

export default App;
