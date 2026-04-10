import React, { useState } from 'react';
import AdminSidebar from '../AdminSidebar/AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="admin-layout-wrapper auth-page-global-bg">
            <div className="bg-mesh opacity-50"></div>
            <div className="bg-vignette"></div>
            
            <AdminSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            
            <main className={`admin-main-content ${isCollapsed ? 'expanded' : 'standard'}`}>
                <div className="admin-content-container animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
