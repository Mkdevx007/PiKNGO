import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Trophy, Star, Shield, Zap, History, ChevronRight, ArrowUpRight, Loader2, Award, Gem, Crown } from 'lucide-react';
import { authApi, orderApi } from '../services/api';
import './VaultPage.css';

const VaultPage = () => {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, ordersRes] = await Promise.all([
                    authApi.getProfile(),
                    orderApi.getMyOrders()
                ]);
                setUser(profileRes);
                setOrders(ordersRes || []);
            } catch (err) {
                console.error("Failed to fetch vault data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const tiers = [
        { 
            name: 'SILVER', 
            minPoints: 0, 
            icon: <Shield size={24} />, 
            color: '#94a3b8',
            perks: ['Standard Earnings', 'Basic Priority', 'Standard Support']
        },
        { 
            name: 'GOLD', 
            minPoints: 1500, 
            icon: <Gem size={24} />, 
            color: '#fbbf24',
            perks: ['1.2x Points Multiplier', 'Priority Preparation', 'Elite Support Access']
        },
        { 
            name: 'ELITE', 
            minPoints: 5000, 
            icon: <Crown size={24} />, 
            color: '#f97316',
            perks: ['1.5x Points Multiplier', 'VVIP Status Badge', 'Zero Delivery Fees', 'Exclusive Hidden Menu']
        }
    ];

    const currentTier = tiers.find(t => t.name === (user?.vaultTier || 'SILVER')) || tiers[0];
    const points = user?.loyaltyPoints || 0;
    
    // Find next tier progress
    const nextTier = tiers.find(t => points < t.minPoints);
    const progress = nextTier 
        ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100 
        : 100;

    if (loading) return (
        <div className="vault-page loading-vault">
            <div className="bg-mesh"></div>
            <div className="loader-hub">
                <Loader2 size={48} className="spinner" />
                <p>SYNCHRONIZING VAULT DATA...</p>
            </div>
        </div>
    );

    return (
        <div className="vault-page animate-fade-in">
            <div className="bg-mesh"></div>
            
            <header className="vault-hero">
                <div className="container">
                    <div className="vault-header-card glass-modern">
                        <div className="vault-id-badge">ELITE VAULT // ACCT-{user?.id?.slice(0, 8)}</div>
                        <div className="vault-main-row">
                            <div className="points-display">
                                <span className="label">AVAILABLE POINTS</span>
                                <h1 className="points-value">
                                    {(points || 0).toLocaleString()}
                                    <Trophy size={32} className="trophy-glow" />
                                </h1>
                            </div>
                            <div className={`tier-badge-large tier-${currentTier.name.toLowerCase()}`}>
                                {currentTier.icon}
                                <span>{currentTier.name} TIER</span>
                            </div>
                        </div>
                        
                        {nextTier && (
                            <div className="progress-section">
                                <div className="progress-header">
                                    <span>Progress to {nextTier.name}</span>
                                    <span>{nextTier.minPoints - points} points left</span>
                                </div>
                                <div className="vault-progress-bar">
                                    <div className="fill" style={{ width: `${progress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="vault-content container">
                <div className="vault-grid">
                    {/* Tier Benefits */}
                    <div className="vault-card tier-benefits glass animate-fade-in-up">
                        <div className="card-header">
                            <Award size={20} />
                            <h3>Your Privileges</h3>
                        </div>
                        <div className="perks-list">
                            {currentTier.perks.map((perk, i) => (
                                <div key={i} className="perk-item">
                                    <Zap size={14} className="zap-icon" />
                                    <span>{perk}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Points History */}
                    <div className="vault-card points-history glass animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="card-header">
                            <History size={20} />
                            <h3>Transmission History</h3>
                        </div>
                        <div className="history-list">
                            {orders.filter(o => (o.pointsEarned || 0) > 0).length > 0 ? (
                                orders.filter(o => (o.pointsEarned || 0) > 0).map((order) => (
                                    <div key={order.id} className="history-item">
                                        <div className="item-main">
                                            <p className="order-target">{order.restaurantName}</p>
                                            <p className="order-date">{new Date(order.createdTs).toLocaleDateString()}</p>
                                        </div>
                                        <div className="points-awarded">
                                            +{order.pointsEarned} <span className="unit">XP</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-history">
                                    <p>No transmissions recorded. Place your first order to begin earning XP.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Elite Tiers Comparison */}
                    <div className="vault-card tier-matrix glass animate-fade-in-up span-full" style={{ animationDelay: '0.2s' }}>
                        <div className="card-header">
                            <Star size={20} />
                            <h3>Echelon Matrix</h3>
                        </div>
                        <div className="tiers-comparison">
                            {tiers.map((t) => (
                                <div key={t.name} className={`tier-card ${user?.vaultTier === t.name ? 'current' : ''}`}>
                                    <div className="tier-header" style={{ color: t.color }}>
                                        {t.icon}
                                        <h4>{t.name}</h4>
                                    </div>
                                    <p className="points-threshold">{t.minPoints}+ Points</p>
                                    <ul className="tier-perks-mini">
                                        {t.perks.slice(0, 3).map((p, i) => (
                                            <li key={i}>{p}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VaultPage;
