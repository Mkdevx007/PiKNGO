import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Filter, MoreVertical, 
    Shield, Mail, Phone, Calendar, 
    ChevronRight, User as UserIcon, ShieldCheck
} from 'lucide-react';
import { authApi } from '../services/api';
import './ManageUsers.css';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await authApi.getUsers();
            setUsers(res.data || []);
        } catch (err) {
            console.error("Failed to fetch users:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => 
        (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phoneNumber || '').includes(searchTerm) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="manage-page animate-fade-in">
            <div className="container">
                <header className="manage-header">
                    <div className="header-left">
                        <h1>Manage <span className="gradient-text">Users</span></h1>
                        <p>Monitor your user base and manage permissions</p>
                    </div>
                    <div className="stats-pills">
                        <div className="stat-pill glass">
                            <Users size={16} />
                            <span>{users.length} Total Users</span>
                        </div>
                    </div>
                </header>

                <div className="manage-controls glass-card">
                    <div className="search-wrapper">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by name, email or phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <button className="filter-pill active">All</button>
                        <button className="filter-pill">Admins</button>
                        <button className="filter-pill">Active</button>
                        <div className="divider"></div>
                        <button className="btn-icon-glass"><Filter size={18} /></button>
                    </div>
                </div>

                <div className="users-table-wrapper glass-card animate-slide-up">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Contact Info</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="skeleton-row animate-pulse">
                                        <td colSpan="5"><div className="skeleton-line"></div></td>
                                    </tr>
                                ))
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">No users found matching your search.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="user-row">
                                        <td>
                                            <div className="user-info-cell">
                                                <div className="user-avatar">
                                                    {user.firstName ? user.firstName[0].toUpperCase() : 'U'}
                                                </div>
                                                <div className="user-name">
                                                    <span className="user-full-name">{user.firstName} {user.lastName}</span>
                                                    <span className="user-id">ID: {user.id.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="contact-details">
                                                <div className="detail"><Mail size={12} /> {user.email || 'N/A'}</div>
                                                <div className="detail"><Phone size={12} /> {user.phoneNumber}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${user.role.toLowerCase()}`}>
                                                {user.role === 'ADMIN' ? <ShieldCheck size={12} /> : <UserIcon size={12} />}
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="status-cell">
                                                <span className={`status-dot ${user.active ? 'active' : 'inactive'}`}></span>
                                                <span>{user.active ? 'Active' : 'Inactive'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="action-menu-btn">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
