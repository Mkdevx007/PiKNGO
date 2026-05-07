import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
    User, LogIn, Menu, X, ChevronDown, LogOut, Settings, 
    Sun, Moon, ShoppingCart, LayoutDashboard, 
    Home, Utensils, Info, ShoppingBag, Users, Flame, Trophy
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import Logo from '../Logo/Logo';
import './Navbar.css';

const Navbar = ({ isLoggedIn, userName, userRole, profileImageUrl, onLogout }) => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { getCartCount } = useCart();
    const userId = localStorage.getItem('userId');

    const getPhotoUrl = () => {
        if (profileImageUrl) return profileImageUrl;
        return `${import.meta.env.VITE_API_BASE_URL}/users/profile/photo/${userId}?t=${new Date().getTime()}`;
    };
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

    // Hide Navbar on Login, Register, and all Admin pages
    if (location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <nav className={`navbar ${isNavbarScrolled ? 'scrolled glass' : 'transparent'}`}>
            <div className="navbar-container">
                <NavLink to={isLoggedIn ? "/dashboard" : "/"} className="logo-link">
                    <Logo size={140} />
                </NavLink>

                <div className={`nav-links ${isOpen ? 'active' : ''}`}>
                    {!isLoggedIn && (
                        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                            <Home size={16} /> <span>Home</span>
                        </NavLink>
                    )}
                    {isLoggedIn && (
                        <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                            <Home size={16} /> <span>Dashboard</span>
                        </NavLink>
                    )}
                    <NavLink to="/trending" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                        <Flame size={16} /> <span>Trending</span>
                    </NavLink>

                    {isLoggedIn && (
                        <NavLink to="/orders" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                            <ShoppingBag size={16} /> <span>My Orders</span>
                        </NavLink>
                    )}

                    {isLoggedIn && userRole === 'ADMIN' && (
                        <NavLink to="/admin/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                            <LayoutDashboard size={16} /> <span style={{ color: '#a78bfa', fontWeight: '900' }}>Admin Hub</span>
                        </NavLink>
                    )}

                    <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                        <Info size={16} /> <span>About</span>
                    </NavLink>
                </div>

                <div className="nav-actions-group">
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle Theme">
                        {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
                    </button>

                    <NavLink to="/checkout" className="cart-nav-link glass-pill">
                        <ShoppingCart size={22} />
                        {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
                    </NavLink>

                    {isLoggedIn ? (
                        <div className="profile-wrapper" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
                            <div className="profile-trigger glass-pill">
                                <div className="avatar-small">
                                    {profileImageUrl || userId ? (
                                        <img 
                                            src={getPhotoUrl()} 
                                            alt="Profile" 
                                            className="nav-profile-img" 
                                            onError={(e) => {
                                                if (!profileImageUrl) {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <User size={12} style={{ display: (profileImageUrl || userId) ? 'none' : 'block' }} />
                                </div>
                                <span className="user-name">{userName}</span>
                                <ChevronDown size={14} className={`chevron ${showDropdown ? 'rotate' : ''}`} />
                            </div>

                            {showDropdown && (
                                <div className="profile-dropdown glass animate-fade-in">
                                    <NavLink to="/profile" className="dropdown-item">
                                        <User size={16} />
                                        <span>Profile</span>
                                    </NavLink>
                                    <NavLink to="/vault" className="dropdown-item">
                                        <Trophy size={16} className="text-orange" />
                                        <span>Elite Vault</span>
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
                            <NavLink to="/login" className="btn-nav-secondary">Login</NavLink>
                            <NavLink to="/register" className="btn-nav-primary">Sign Up</NavLink>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
