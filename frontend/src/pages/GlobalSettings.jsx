import React, { useState, useEffect } from 'react';
import { 
    Settings, Shield, Bell, Globe, 
    Save, RefreshCcw, Lock, CreditCard,
    CheckCircle
} from 'lucide-react';
import { adminSettingsApi } from '../services/api';
import './GlobalSettings.css';

const GlobalSettings = () => {
    const [activeTab, setActiveTab] = useState('security');
    const [toastMessage, setToastMessage] = useState('');
    const [settings, setSettings] = useState({
        platformName: '',
        maintenanceMode: false,
        deliveryFee: 0,
        tax: 0
    });

    const fetchSettings = async () => {
        try {
            const response = await adminSettingsApi.getGlobalSettings();
            const data = response;
            if (data) {
                setSettings({
                    platformName: data.platformName || 'PikNGo Premium',
                    maintenanceMode: data.maintenanceMode || false,
                    deliveryFee: data.deliveryFee || 45,
                    tax: data.taxPercentage || 5
                });
            }
        } catch (e) {
            console.error("Failed to load global settings", e);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleSave = async () => {
        try {
            const apiPayload = {
                platformName: settings.platformName,
                maintenanceMode: settings.maintenanceMode,
                deliveryFee: parseFloat(settings.deliveryFee),
                taxPercentage: parseFloat(settings.tax)
            };
            await adminSettingsApi.updateGlobalSettings(apiPayload);
            showToast('Global settings saved and applied.');
        } catch (e) {
            showToast('Failed to save settings.');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="settings-page animate-fade-in">
            {toastMessage && (
                <div className="promo-toast elite-entrance">
                    <CheckCircle size={16} />
                    {toastMessage}
                </div>
            )}
            <header className="page-header elite-header-card">
                <div className="header-left">
                    <span className="elite-h-accent">CORE CONFIGURATION // SYSTEM PARAMS</span>
                    <h1>Platform <span className="gradient-text">Settings</span></h1>
                    <p>Global sovereignty and operational directives</p>
                </div>
                <button className="btn-primary-glow" onClick={handleSave}>
                    <Save size={18} />
                    <span>APPLY CHANGES</span>
                </button>
            </header>

            <div className="settings-grid">
                <div className="settings-main">
                    {activeTab === 'security' && (
                        <div className="tab-pane animate-fade-in">
                            <section className="settings-section glass-card">
                                <div className="section-header">
                                    <Globe size={20} />
                                    <h3>General Configuration</h3>
                                </div>
                                <div className="settings-options">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Platform Name</label>
                                            <p>Used across customer communications</p>
                                        </div>
                                        <input type="text" name="platformName" value={settings.platformName} onChange={handleChange} className="glass-modern-input" />
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Maintenance Mode</label>
                                            <p>Disable ordering for all users</p>
                                        </div>
                                        <div className="toggle-switch">
                                            <input type="checkbox" id="m-mode" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
                                            <label htmlFor="m-mode"></label>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="settings-section glass-card">
                                <div className="section-header">
                                    <CreditCard size={20} />
                                    <h3>Fees & Charges</h3>
                                </div>
                                <div className="settings-options">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Standard Delivery Fee</label>
                                            <p>Global flat rate for doorstep delivery</p>
                                        </div>
                                        <div className="input-with-symbol">
                                            <span>₹</span>
                                            <input type="number" name="deliveryFee" value={settings.deliveryFee} onChange={handleChange} className="glass-modern-input" />
                                        </div>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Service Tax (%)</label>
                                            <p>Applied to total bill amount</p>
                                        </div>
                                        <div className="input-with-symbol">
                                            <span>%</span>
                                            <input type="number" name="tax" value={settings.tax} onChange={handleChange} className="glass-modern-input" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="tab-pane animate-fade-in">
                            <section className="settings-section glass-card">
                                <div className="section-header">
                                    <Bell size={20} />
                                    <h3>Push & Email Alerts</h3>
                                </div>
                                <div className="settings-options">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Order Updates (SMS)</label>
                                            <p>Send order tracking SMS to customers</p>
                                        </div>
                                        <div className="toggle-switch">
                                            <input type="checkbox" id="sms-updates" defaultChecked />
                                            <label htmlFor="sms-updates"></label>
                                        </div>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Daily Restaurant Reports</label>
                                            <p>Email end-of-day sales data to owners</p>
                                        </div>
                                        <div className="toggle-switch">
                                            <input type="checkbox" id="daily-reports" defaultChecked />
                                            <label htmlFor="daily-reports"></label>
                                        </div>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Support Escalations</label>
                                            <p>Notify Super Admin on critical tickets</p>
                                        </div>
                                        <div className="toggle-switch">
                                            <input type="checkbox" id="support-esc" />
                                            <label htmlFor="support-esc"></label>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'permissions' && (
                        <div className="tab-pane animate-fade-in">
                            <section className="settings-section glass-card">
                                <div className="section-header">
                                    <Shield size={20} />
                                    <h3>Role Based Access Control</h3>
                                </div>
                                <div className="settings-options">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Managers can delete orders</label>
                                            <p>Allow branch managers to cancel active orders</p>
                                        </div>
                                        <div className="toggle-switch">
                                            <input type="checkbox" id="mgr-delete" />
                                            <label htmlFor="mgr-delete"></label>
                                        </div>
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Support Staff Dashboard</label>
                                            <p>Grant support staff access to analytics</p>
                                        </div>
                                        <div className="toggle-switch">
                                            <input type="checkbox" id="support-analytics" defaultChecked />
                                            <label htmlFor="support-analytics"></label>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    {activeTab === 'apikeys' && (
                        <div className="tab-pane animate-fade-in">
                            <section className="settings-section glass-card">
                                <div className="section-header">
                                    <RefreshCcw size={20} />
                                    <h3>External Integrations</h3>
                                </div>
                                <div className="settings-options">
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Payment Gateway Webhook</label>
                                            <p>Endpoint URL for Razorpay/Stripe events</p>
                                        </div>
                                        <input type="text" defaultValue="https://api.pikngo.com/v1/webhooks/pay" className="glass-modern-input" style={{ width: '280px' }} />
                                    </div>
                                    <div className="setting-item">
                                        <div className="setting-info">
                                            <label>Maps API Key</label>
                                            <p>Google Maps / Mapbox secret key</p>
                                        </div>
                                        <div className="input-with-symbol">
                                            <span>🔑</span>
                                            <input type="password" defaultValue="AIzaSyAXXXXXXX_XXXXXXXX" className="glass-modern-input" />
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                <aside className="settings-sidebar">
                    <div className="sidebar-group glass-card">
                        <h3>Quick Navigation</h3>
                        <nav className="mini-nav">
                            <button className={activeTab === 'security' ? 'active' : ''} onClick={() => setActiveTab('security')}><Shield size={16} /> Security</button>
                            <button className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}><Bell size={16} /> Notifications</button>
                            <button className={activeTab === 'permissions' ? 'active' : ''} onClick={() => setActiveTab('permissions')}><Lock size={16} /> Permissions</button>
                            <button className={activeTab === 'apikeys' ? 'active' : ''} onClick={() => setActiveTab('apikeys')}><RefreshCcw size={16} /> API Keys</button>
                        </nav>
                    </div>

                    <div className="help-card glass-card">
                        <div className="help-icon">💡</div>
                        <h4>Need Help?</h4>
                        <p>Changes made here are applied globally across all restaurant partners and user apps.</p>
                        <button className="btn-text">Documentation →</button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default GlobalSettings;
