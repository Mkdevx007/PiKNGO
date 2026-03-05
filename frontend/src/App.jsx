import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import ProfileScreen from './pages/ProfileScreen';
import AboutPage from './pages/AboutPage';
import MenuPage from './pages/MenuPage';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // Handle Login State
  const handleLogin = (data) => {
    setIsLoggedIn(true);
    setUserName(data.phoneNumber);
    localStorage.setItem('token', data.token);
    localStorage.setItem('phone', data.phoneNumber);
    localStorage.setItem('userId', data.userId);
  };

  // Logout logic
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('phone');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    setUserName('');
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const phone = localStorage.getItem('phone');
    if (token) {
      setIsLoggedIn(true);
      setUserName(phone || 'User');
    }
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <div className="app">
          <Navbar isLoggedIn={isLoggedIn} userName={userName} onLogout={handleLogout} />
          <main>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
              <Route path="/register" element={<AuthPage onLogin={handleLogin} />} />
              <Route path="/profile" element={isLoggedIn ? <ProfileScreen /> : <Navigate to="/login" />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/menu/:restaurantId" element={<MenuPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
