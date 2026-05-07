import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './MobileNav.css';

const MobileNav = () => {
    const { getCartCount } = useCart();
    const location = useLocation();

    // Hide MobileNav on Auth and Admin pages
    const isAuthRoute = location.pathname === '/login' || location.pathname === '/register';
    const isAdminRoute = location.pathname.startsWith('/admin');
    
    if (isAuthRoute || isAdminRoute) return null;

    const cartCount = getCartCount();

    return (
        <nav className="mobile-nav" role="navigation" aria-label="Main mobile navigation">
            <NavLink
                to="/dashboard"
                id="mobile-nav-home"
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                aria-label="Home"
            >
                <div className="nav-icon-wrap">
                    <Home size={22} strokeWidth={2} />
                </div>
                <span>Home</span>
            </NavLink>

            <NavLink
                to="/vault"
                id="mobile-nav-explore"
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                aria-label="Explore"
            >
                <div className="nav-icon-wrap">
                    <Map size={22} strokeWidth={2} />
                </div>
                <span>Explore</span>
            </NavLink>

            <NavLink
                to="/orders"
                id="mobile-nav-orders"
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                aria-label={`Orders${cartCount > 0 ? `, ${cartCount} items in cart` : ''}`}
            >
                <div className="nav-icon-wrap">
                    <div className="orders-icon-wrapper">
                        <ShoppingBag size={22} strokeWidth={2} />
                        {cartCount > 0 && (
                            <span className="mobile-cart-badge" aria-hidden="true">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </div>
                </div>
                <span>Orders</span>
            </NavLink>

            <NavLink
                to="/profile"
                id="mobile-nav-profile"
                className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
                aria-label="Profile"
            >
                <div className="nav-icon-wrap">
                    <User size={22} strokeWidth={2} />
                </div>
                <span>Profile</span>
            </NavLink>

            <div className="mobile-nav-indicator" aria-hidden="true" />
        </nav>
    );
};

export default MobileNav;
