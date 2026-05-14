import React, { useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar/Navbar';
import { authApi } from './services/api';
import { CartProvider } from './context/CartContext';
import { requestNotificationPermission } from './services/notificationService';
import './App.css';
import { ToastProvider } from './context/ToastContext';

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ProfileScreen = lazy(() => import('./pages/ProfileScreen'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TrendingPage = lazy(() => import('./pages/TrendingPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const ManageRestaurants = lazy(() => import('./pages/ManageRestaurants'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const ManageMenu = lazy(() => import('./pages/ManageMenu'));
const ManageUsers = lazy(() => import('./pages/ManageUsers'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const GlobalOrders = lazy(() => import('./pages/GlobalOrders'));
const GlobalSettings = lazy(() => import('./pages/GlobalSettings'));
const Promotions = lazy(() => import('./pages/Promotions'));
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'));
const AdminLayout = lazy(() => import('./components/AdminLayout/AdminLayout'));
const VaultPage = lazy(() => import('./pages/VaultPage'));
const RiderDashboard = lazy(() => import('./pages/RiderDashboard'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));

// Static imports for non-page components to keep UI stable
import Footer from './components/Footer/Footer';
import ActiveOrderBar from './components/ActiveOrderBar/ActiveOrderBar';
import MobileNav from './components/MobileNav/MobileNav';

// Premium Fallback Loader
const PageLoader = () => (
  <div className="elite-page-loader">
    <div className="loader-glow"></div>
    <div className="loader-content">
      <div className="loading-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  </div>
);

// Inner component to use hooks inside Router context
function AppContent({ isLoggedIn, userName, userRole, profileImageUrl, handleLogin, handleLogout }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isPartnerRoute = location.pathname.startsWith('/partner');
  const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
  const shouldHideGlobalComponents = isAdminRoute || isPartnerRoute || isAuthRoute;

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
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={isLoggedIn ? (userRole === 'RESTAURANT_OWNER' ? <Navigate to="/partner" /> : userRole === 'DELIVERY_RIDER' ? <Navigate to="/rider" /> : <Navigate to="/dashboard" />) : <LandingPage isLoggedIn={isLoggedIn} />} />
            <Route path="/dashboard" element={isLoggedIn ? (userRole === 'RESTAURANT_OWNER' ? <Navigate to="/partner" /> : userRole === 'DELIVERY_RIDER' ? <Navigate to="/rider" /> : <Dashboard />) : <Navigate to="/login" />} />
            <Route path="/partner" element={isLoggedIn && userRole === 'RESTAURANT_OWNER' ? <PartnerDashboard /> : <Navigate to="/login" />} />
            <Route path="/rider" element={isLoggedIn && userRole === 'DELIVERY_RIDER' ? <RiderDashboard /> : <Navigate to="/login" />} />
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
                  <Suspense fallback={<PageLoader />}>
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
                  </Suspense>
                </AdminLayout>
              ) : <Navigate to="/" />
            } />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
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
      
      // Request Notification Permission and register FCM token
      await requestNotificationPermission();
    } catch (_err) {
      console.warn("Failed to fetch full profile after login");
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

        // Ensure notifications are registered on resume session
        requestNotificationPermission();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
