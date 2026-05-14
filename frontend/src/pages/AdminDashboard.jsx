import React, { useState, useEffect } from 'react';
import { 
    Users, Store, ShoppingBag, 
    TrendingUp, ArrowUpRight, ArrowDownRight,
    Clock, IndianRupee, Activity, Package, Smartphone,
    Loader2, Brain, Sparkles, Award, Truck, AlertTriangle, Cpu, Zap
} from 'lucide-react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, AreaChart, Area,
    BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { orderApi, adminAnalyticsApi } from '../services/api';
import AiChatConsole from '../components/AiChat/AiChatConsole';
import './AdminDashboard.css';

const data = [
    { name: 'Mon', orders: 400, revenue: 2400 },
    { name: 'Tue', orders: 300, revenue: 1398 },
    { name: 'Wed', orders: 200, revenue: 9800 },
    { name: 'Thu', orders: 278, revenue: 3908 },
    { name: 'Fri', orders: 189, revenue: 4800 },
    { name: 'Sat', orders: 239, revenue: 3800 },
    { name: 'Sun', orders: 349, revenue: 4300 },
];

import { useToast } from '../context/ToastContext';

const COLORS = ['#ff6b00', '#00c49f', '#ffbb28', '#ff8042', '#3b82f6', '#8b5cf6'];

const AdminDashboard = () => {
    const { showToast } = useToast();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRestaurants: 0,
        totalOrders: 0,
        totalRevenue: 0,
        pickupOrders: 0,
        deliveryOrders: 0,
        recentActivity: [],
        chartData: [],
        statusDistribution: [],
        restaurantRevenue: [],
        aiInsights: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const [analyticsRes, orders] = await Promise.all([
                adminAnalyticsApi.getDashboardStats(),
                orderApi.getAllOrders(0, 10) // Just get a few for the list
            ]);

            const statsRes = analyticsRes || {};
            const allOrdersRaw = orders || [];
            const recentOrders = Array.isArray(allOrdersRaw) ? allOrdersRaw : (allOrdersRaw?.content || []);
            
            // Format status distribution for Pie Chart
            const statusDist = statsRes.orderStatusDistribution || {};
            const pieData = Object.keys(statusDist).map(key => ({
                name: key,
                value: statusDist[key]
            }));

            setStats({
                totalUsers: statsRes.totalUsers || 0,
                totalRestaurants: statsRes.totalRestaurants || 0,
                totalOrders: statsRes.totalOrders || 0,
                totalRevenue: statsRes.totalRevenue || 0,
                pickupOrders: statsRes.pickupOrders || 0,
                deliveryOrders: statsRes.deliveryOrders || 0,
                recentActivity: recentOrders.slice(0, 5),
                chartData: statsRes.weeklyRevenue || [],
                statusDistribution: pieData,
                restaurantRevenue: statsRes.topRestaurants || [],
                aiInsights: statsRes.aiInsights || []
            });
            
            showToast('Analytics refreshed successfully', 'success');
        } catch (err) {
            console.error("Failed to fetch dashboard stats:", err);
            showToast('Failed to refresh data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const MetricCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, borderClass, delay }) => (
        <div className={`metric-card glass-card hover-glow ${colorClass} ${borderClass || ''}`} style={{ animationDelay: delay }}>
            <div className="card-inner">
                <div className="icon-box">
                    <Icon size={24} />
                </div>
                <div className="card-info">
                    <p className="card-label">{title}</p>
                    <h3 className="card-value">{value}</h3>
                    {trend && (
                        <div className={`trend ${trend === 'up' ? 'positive' : 'negative'}`}>
                            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            <span>{trendValue}%</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="card-decoration"></div>
        </div>
    );

    return (
        <div className="admin-dashboard animate-fade-in">
            <header className="dashboard-header-row elite-header-card">
                <div className="header-left">
                    <span className="elite-h-accent">GLOBAL OPERATIONS // ANALYTICS HUD</span>
                    <h1>Command <span className="gradient-text">Center</span></h1>
                    <p>Real-time performance surveillance of the PikNGo network</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh glass-pill" onClick={fetchStats} disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <Activity size={16} />}
                        <span>{loading ? 'RE-SYNC' : 'REFRESH INTEL'}</span>
                    </button>
                    <div className="live-pill">
                        <span className="elite-status-dot active"></span>
                        LIVE STREAM
                    </div>
                </div>
            </header>

            <div className="metrics-grid">
                <MetricCard 
                    title="Total Revenue" 
                    value={`₹${(stats.totalRevenue || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
                    icon={IndianRupee} 
                    trend="up" trendValue="12.5"
                    colorClass="gold"
                    delay="0s"
                />
                <MetricCard 
                    title="Total Orders" 
                    value={stats.totalOrders} 
                    icon={ShoppingBag} 
                    trend="up" trendValue="8.2"
                    colorClass="orange"
                    delay="0.1s"
                />
                <MetricCard 
                    title="Active Users" 
                    value={stats.totalUsers} 
                    icon={Users} 
                    trend="up" trendValue="5.4"
                    colorClass="blue"
                    delay="0.2s"
                />
                <MetricCard 
                    title="Partners" 
                    value={stats.totalRestaurants} 
                    icon={Store} 
                    trend="down" trendValue="1.2"
                    colorClass="purple"
                    delay="0.3s"
                />
            </div>

            <div className="ai-intelligence-hub glass-card elite-border animate-slide-up">
                <div className="ai-header">
                    <div className="ai-title">
                        <Brain className="ai-brain-icon" size={24} />
                        <h3>Neural Intelligence Hub</h3>
                        <div className="ai-status">
                            <Sparkles size={12} className="sparkle-anim" />
                            ANALYZING LIVE DATA
                        </div>
                    </div>
                </div>
                <div className="insights-grid">
                    {stats.aiInsights && stats.aiInsights.length > 0 ? stats.aiInsights.map((insight, idx) => {
                        const Icon = {
                            zap: Zap,
                            'trending-up': TrendingUp,
                            award: Award,
                            truck: Truck,
                            'alert-triangle': AlertTriangle,
                            cpu: Cpu
                        }[insight.icon] || Activity;

                        return (
                            <div key={idx} className={`insight-card ${insight.type.toLowerCase()}`}>
                                <div className="insight-icon">
                                    <Icon size={18} />
                                </div>
                                <div className="insight-content">
                                    <p>{insight.message}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="insight-loading">
                            <Loader2 className="animate-spin" size={20} />
                            <span>Booting AI logic engine...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="charts-main-grid">
                {/* Revenue & Growth Chart */}
                <div className="chart-container glass-card span-2">
                    <div className="chart-header">
                        <h3>Order & Revenue Trends</h3>
                        <p>Weekly performance overview</p>
                    </div>
                    <div className="chart-body" style={{ position: 'relative' }}>
                        {stats.totalOrders === 0 && (
                            <div className="mock-chart-overlay animate-fade-in">
                                <div className="mock-badge pulse-dot-container">
                                    <span className="pulse-dot"></span>
                                    Awaiting First Order
                                </div>
                            </div>
                        )}
                        <div className={`chart-wrapper ${stats.totalOrders === 0 ? 'blurred-state' : ''}`}>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={stats.chartData.length > 0 ? stats.chartData : data}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="var(--accent-orange)" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        stroke="rgba(255,255,255,0.4)" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        dy={10}
                                    />
                                    <YAxis 
                                        stroke="rgba(255,255,255,0.4)" 
                                        fontSize={12} 
                                        tickLine={false} 
                                        axisLine={false} 
                                        dx={-10}
                                    />
                                    <Tooltip 
                                        contentStyle={{ 
                                            background: 'rgba(15, 23, 42, 0.9)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            borderRadius: '16px',
                                            backdropFilter: 'blur(10px)',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                        }}
                                        itemStyle={{ color: '#fff', fontSize: '13px', fontWeight: 'bold' }}
                                        cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="var(--accent-orange)" 
                                        fillOpacity={1} 
                                        fill="url(#colorRev)" 
                                        strokeWidth={4} 
                                        dot={{ fill: 'var(--accent-orange)', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="orders" 
                                        stroke="#3b82f6" 
                                        fillOpacity={1} 
                                        fill="url(#colorOrders)" 
                                        strokeWidth={2} 
                                        strokeDasharray="5 5"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Revenue by Restaurant Chart */}
                <div className="chart-container glass-card">
                    <div className="chart-header">
                        <h3>Top Partners by Revenue</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stats.restaurantRevenue.length > 0 ? stats.restaurantRevenue : [{name: 'Loading...', value: 100}]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} tick={false} />
                                <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
                                <Tooltip 
                                    contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                />
                                <Bar dataKey="value" radius={[5, 5, 0, 0]}>
                                    {stats.restaurantRevenue.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Categories Distribution */}
                <div className="chart-container glass-card">
                    <div className="chart-header">
                        <h3>Order Type Distribution</h3>
                    </div>
                    <div className="chart-body chart-container centered" style={{ position: 'relative', height: '300px' }}>
                        <div className={`chart-wrapper ${stats.totalOrders === 0 ? 'blurred-state' : ''}`} style={{ width: '100%', height: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                         data={
                                             stats.statusDistribution && stats.statusDistribution.length > 0
                                             ? stats.statusDistribution
                                             : [ { name: 'No Data', value: 100 } ]
                                         }
                                         cx="50%"
                                         cy="50%"
                                         innerRadius={70}
                                         outerRadius={90}
                                         paddingAngle={5}
                                         dataKey="value"
                                     >
                                         {(stats.statusDistribution || []).map((entry, index) => (
                                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                         ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Activity Mini List */}
                <div className="activity-container glass-card span-2">
                    <div className="chart-header">
                        <h3>Recent Transactions</h3>
                    </div>
                    <div className="activity-list grid-activity">
                        {stats.recentActivity.map((order) => (
                            <div key={order.id} className="activity-item">
                                <div className={`activity-icon ${order.isSelfPickup ? 'purple' : 'blue'}`}>
                                    {order.isSelfPickup ? <Smartphone size={14} /> : <Package size={14} />}
                                </div>
                                <div className="activity-details">
                                    <p>Order <strong>#{ (order._id || order.id || 'N/A').toString().substring(0, 6) }</strong> {order.isSelfPickup ? 'for pickup' : 'for delivery'}</p>
                                    <span>{order.createdTs ? new Date(order.createdTs).toLocaleTimeString() : 'Recently'}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <AiChatConsole />
        </div>
    );
};

export default AdminDashboard;
