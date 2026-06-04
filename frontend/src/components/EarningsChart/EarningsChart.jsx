import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './EarningsChart.css';

const EarningsChart = ({ data }) => {
    // Default mock data if none provided
    const chartData = data || [
        { name: 'Mon', earnings: 1200 },
        { name: 'Tue', earnings: 1800 },
        { name: 'Wed', earnings: 1400 },
        { name: 'Thu', earnings: 2200 },
        { name: 'Fri', earnings: 2800 },
        { name: 'Sat', earnings: 3500 },
        { name: 'Sun', earnings: 4200 },
    ];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="label">{`${label}`}</p>
                    <p className="intro">₹{`${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="earnings-chart-wrapper">
            <h3 className="chart-title">Weekly Earnings</h3>
            <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.3)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default EarningsChart;
