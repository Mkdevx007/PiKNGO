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
import './App.css';



function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // Handle Login State
  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserName(data.phoneNumber);
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
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await authApi.getProfile();
        setIsLoggedIn(true);
        setUserName(response.data.phoneNumber);
      } catch (err) {
        setIsLoggedIn(false);
        setUserName('');
      }
    };
    checkAuth();
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Navbar isLoggedIn={isLoggedIn} userName={userName} onLogout={handleLogout} />
          <main>
            <Routes>
              <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <LandingPage isLoggedIn={isLoggedIn} />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />

              <Route path="/register" element={<AuthPage onLogin={handleLogin} />} />
              <Route path="/profile" element={isLoggedIn ? <ProfileScreen /> : <Navigate to="/login" />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/trending" element={<TrendingPage />} />
              <Route path="/menu/:restaurantId" element={<MenuPage />} />
              <Route path="*" element={<Navigate to="/" />} />


            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
