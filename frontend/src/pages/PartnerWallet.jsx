import React from 'react';
import { IndianRupee, Clock, ArrowRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const PartnerWallet = ({ stats }) => {
    const { showToast } = useToast();
    
    // Fallback if stats is empty
    const revenue = stats?.revenue || 0;
    const dailyRevenue = stats?.dailyRevenue || {};
    
    // Sort dates descending
    const sortedDates = Object.keys(dailyRevenue).sort((a, b) => new Date(b) - new Date(a));

    const handleWithdraw = () => {
        showToast("Withdraw request initiated! Funds will arrive in 2-3 business days.", "success");
    };

    return (
        <div className="partner-wallet-section animate-slide-up" style={{ padding: '1rem 0' }}>
            <div className="section-header" style={{ marginBottom: '2rem' }}>
                <h2>Earnings & Payouts</h2>
            </div>
            
            <div className="wallet-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="wallet-card glass-modern" style={{ padding: '2rem', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(255,107,0,0.1) 0%, rgba(255,107,0,0.02) 100%)', border: '1px solid rgba(255,107,0,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'rgba(255,107,0,0.2)', padding: '12px', borderRadius: '12px', color: '#ff6b00' }}>
                            <IndianRupee size={24} />
                        </div>
                        <span style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Available Balance</span>
                    </div>
                    <h1 style={{ fontSize: '3rem', fontWeight: '900', color: '#ff6b00', marginBottom: '1.5rem' }}>₹{revenue}</h1>
                    <button onClick={handleWithdraw} style={{ width: '100%', padding: '1rem', background: '#ff6b00', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                        WITHDRAW TO BANK
                    </button>
                </div>
                
                <div className="wallet-card glass-modern" style={{ padding: '2rem', borderRadius: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Lifetime Earnings</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1.5rem' }}>₹{revenue}</h2>
                    
                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total Orders Delivered</span>
                    <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>{stats?.totalOrders || 0}</h2>
                </div>
            </div>

            <div className="payout-history glass-modern" style={{ padding: '2rem', borderRadius: '20px' }}>
                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="#ff6b00" /> Recent Daily Earnings
                </h3>
                
                {sortedDates.length === 0 ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                        No earning history yet.
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {sortedDates.map(date => (
                            <div key={date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>{date}</span>
                                    <span style={{ fontSize: '0.8rem', color: '#22c55e', fontWeight: '600' }}>Completed</span>
                                </div>
                                <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#ff6b00' }}>
                                    +₹{dailyRevenue[date]}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerWallet;
