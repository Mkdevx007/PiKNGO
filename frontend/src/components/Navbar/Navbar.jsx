import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { User, LogIn, Menu, X, ChevronDown, LogOut, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../Logo/Logo';
import './Navbar.css';

const Navbar = ({ isLoggedIn, userName, onLogout }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const location = useLocation();

    // Force solid navbar on specific pages
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/profile';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        handleScroll(); // Initial check
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Determine if navbar should be glassy/scrolled
    const isNavbarScrolled = scrolled || isAuthPage;

    // Hide Navbar on Login and Register pages
    if (location.pathname === '/login' || location.pathname === '/register') {
        return null;
    }

    return (
        <nav className={`navbar ${isNavbarScrolled ? 'scrolled glass' : 'transparent'}`}>
            <div className="navbar-container">
                <NavLink to="/" className="logo-link">
                    <Logo size={28} />
                </NavLink>

                <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                    <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsOpen(false)}>Home</NavLink>
                    <NavLink to="/trending" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsOpen(false)}>Food</NavLink>
                    <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''} onClick={() => setIsOpen(false)}>About</NavLink>
                </div>

                <div className="nav-actions-group">
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </button>

                    {isLoggedIn ? (
                        <div className="profile-wrapper" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                            <div className="profile-trigger glass-pill">
                                <div className="avatar-small">
                                    <User size={12} />
                                </div>
                                <span className="user-name">{userName}</span>
                                <ChevronDown size={10} className={`chevron ${showDropdown ? 'rotate' : ''}`} />
                            </div>

                            {showDropdown && (
                                <div className="profile-dropdown glass animate-fade-in">
                                    <NavLink to="/profile" className="dropdown-item">
                                        <User size={16} />
                                        <span>Profile</span>
                                    </NavLink>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item logout-item" onClick={onLogout}>
                                        <LogOut size={16} />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-btns">
                            <NavLink to="/login" className="btn-secondary-slim">Login</NavLink>
                            <NavLink to="/register" className="btn-primary-slim">Sign Up</NavLink>
                        </div>
                    )}
                    <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
