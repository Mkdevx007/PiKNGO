import React, { useState, useEffect } from 'react';
import { 
    Users, Search, Filter, MoreVertical, 
    Shield, Mail, Phone, Calendar, 
    ChevronRight, User as UserIcon, ShieldCheck,
    UserPlus, UserMinus, ShieldAlert, Trash2, AlertCircle,
    ChevronLeft, Loader2
} from 'lucide-react';
import { authApi } from '../services/api';
import './ManageUsers.css';
import './GlobalOrders.css'; // Borrowing segment controls and radar empty state
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/Common/Skeleton';

const ManageUsers = () => {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [actionMenuUserId, setActionMenuUserId] = useState(null);
    const [pagination, setPagination] = useState({
        page: 0,
        size: 10,
        totalElements: 0,
        totalPages: 0
    });

    useEffect(() => {
        fetchUsers(0);
    }, []);

    const fetchUsers = async (page) => {
        setLoading(true);
        try {
            const res = await authApi.getUsers(page, pagination.size);
            const data = res;
            if (data && data.content) {
                const normalizedUsers = data.content.map(u => ({
                    ...u,
                    isActive: u.isActive !== undefined ? u.isActive : u.active,
                    isDeleted: u.isDeleted !== undefined ? u.isDeleted : u.deleted
                }));
                setUsers(normalizedUsers);
                setPagination({
                    page: data.number,
                    size: data.size,
                    totalElements: data.totalElements,
                    totalPages: data.totalPages
                });
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
            showToast('Failed to load user registry', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            fetchUsers(newPage);
        }
    };

    const handleToggleStatus = async (user) => {
        try {
            await authApi.updateStatus(user.id, !user.isActive);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive, isDeleted: false } : u));
            setActionMenuUserId(null);
            showToast(`User ${user.firstName} is now ${!user.isActive ? 'Active' : 'Inactive'}`, 'info');
        } catch (err) {
            console.error("Failed to update status:", err);
            showToast('Error updating user status', 'error');
        }
    };

    const handleToggleRole = async (user) => {
        const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
        try {
            await authApi.updateRole(user.id, newRole);
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
            setActionMenuUserId(null);
            showToast(`${user.firstName}'s role updated to ${newRole}`, 'success');
        } catch (err) {
            console.error("Failed to update role:", err);
            showToast('Error updating user role', 'error');
        }
    };

    const handlePermanentDelete = async (user) => {
        const confirmFirst = window.confirm(`WARNING: Are you sure you want to PERMANENTLY DELETE user ${user.firstName} ${user.lastName}? This action CANNOT be undone.`);
        if (!confirmFirst) return;

        try {
            await authApi.adminDeleteUser(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
            setActionMenuUserId(null);
            showToast(`User ${user.email} permanently deleted`, 'warning');
        } catch (err) {
            console.error("Failed to permanently delete user:", err);
            showToast('Error deleting user. Dependency constraints likely.', 'error');
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = (user.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (user.lastName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (user.phoneNumber || '').includes(searchTerm) ||
                              (user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || 
                            (roleFilter === 'Admins' && user.role === 'ADMIN') || 
                            (roleFilter === 'Users' && user.role === 'USER');
        const matchesStatus = statusFilter === 'All' || 
                              (statusFilter === 'Active' && user.isActive) || 
                              (statusFilter === 'Inactive' && !user.isActive);

        return matchesSearch && matchesRole && matchesStatus;
    });

    useEffect(() => {
        const handleClickOutside = () => setActionMenuUserId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const getStatusInfo = (user) => {
        if (user.isDeleted) return { label: 'Deactivated', className: 'deactivated', icon: <AlertCircle size={12} /> };
        if (user.isActive) return { label: 'Active', className: 'active', icon: null };
        return { label: 'Inactive', className: 'inactive', icon: null };
    };

    return (
        <div className="manage-page animate-fade-in">
            <div className="container">
                <header className="manage-header">
                    <div className="header-left">
                        <h1>Manage <span className="gradient-text">Users</span></h1>
                        <p>Monitor your user base and manage permissions with production-grade tools</p>
                    </div>
                    <div className="stats-pills">
                        <div className="stat-pill glass">
                            <Users size={16} />
                            <span>{pagination.totalElements} Total Users</span>
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
                    <div className="filter-group segment-filter-group">
                        <div className="orders-type-segment">
                            <button className={`segment-btn ${roleFilter === 'All' ? 'active' : ''}`} onClick={() => setRoleFilter('All')}>All Roles</button>
                            <button className={`segment-btn ${roleFilter === 'Admins' ? 'active' : ''}`} onClick={() => setRoleFilter('Admins')}><ShieldCheck size={14} /> Admins</button>
                            <button className={`segment-btn ${roleFilter === 'Users' ? 'active' : ''}`} onClick={() => setRoleFilter('Users')}><UserIcon size={14} /> Users</button>
                        </div>
                        <div className="orders-type-segment">
                            <button className={`segment-btn ${statusFilter === 'All' ? 'active' : ''}`} onClick={() => setStatusFilter('All')}>All</button>
                            <button className={`segment-btn ${statusFilter === 'Active' ? 'active' : ''}`} onClick={() => setStatusFilter('Active')}>Active</button>
                            <button className={`segment-btn ${statusFilter === 'Inactive' ? 'active' : ''}`} onClick={() => setStatusFilter('Inactive')}>Inactive</button>
                        </div>
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
                                <tr>
                                    <td colSpan="5">
                                        <TableSkeleton rows={pagination.size} />
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state-cell">
                                        <div className="empty-state-missions span-full" style={{ padding: '4rem 1rem', background: 'transparent' }}>
                                            <div className="empty-globe">
                                                <Search size={40} className="globe-icon" />
                                                <div className="radar-sweep"></div>
                                            </div>
                                            <h3>Registry Clear: No Users Found</h3>
                                            <p>No user records match your current search and role filters.</p>
                                            {(searchTerm || roleFilter !== 'All' || statusFilter !== 'All') && (
                                                <button className="reset-filters-btn" onClick={() => { setSearchTerm(''); setRoleFilter('All'); setStatusFilter('All'); }}>
                                                    Reset Filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => {
                                    const status = getStatusInfo(user);
                                    return (
                                        <tr key={user.id} className={`user-row ${user.isDeleted ? 'row-deactivated' : ''}`}>
                                            <td>
                                                <div className="user-info-cell">
                                                    <div className={`user-avatar ${user.isDeleted ? 'avatar-deactivated' : ''}`}>
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
                                                    <span className={`status-dot ${status.className}`}></span>
                                                    <span className={`status-label ${status.className}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="action-cell">
                                                    <button 
                                                        className={`action-menu-btn ${actionMenuUserId === user.id ? 'active' : ''}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActionMenuUserId(actionMenuUserId === user.id ? null : user.id);
                                                        }}
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {actionMenuUserId === user.id && (
                                                        <div className="action-dropdown glass-modern animate-scale-in" onClick={e => e.stopPropagation()}>
                                                            <div className="dropdown-header">User Actions</div>
                                                            <button className="dropdown-item" onClick={() => handleToggleRole(user)}>
                                                                {user.role === 'ADMIN' ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                                                <span>Make {user.role === 'ADMIN' ? 'User' : 'Admin'}</span>
                                                            </button>
                                                            <button className={`dropdown-item ${user.isActive ? 'deactivate' : 'activate'}`} onClick={() => handleToggleStatus(user)}>
                                                                {user.isActive ? <UserMinus size={14} /> : <UserPlus size={14} />}
                                                                <span>{user.isActive ? 'Deactivate' : 'Activate'}</span>
                                                            </button>
                                                            <div className="dropdown-divider"></div>
                                                            <button className="dropdown-item delete" onClick={() => handlePermanentDelete(user)}>
                                                                <Trash2 size={14} />
                                                                <span>Permanent Delete</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {pagination.totalPages > 1 && (
                    <div className="pagination-controls glass animate-fade-in">
                        <button 
                            disabled={pagination.page === 0}
                            onClick={() => handlePageChange(pagination.page - 1)}
                            className="page-btn"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="page-info">
                            Page <strong>{pagination.page + 1}</strong> of {pagination.totalPages}
                        </span>
                        <button 
                            disabled={pagination.page === pagination.totalPages - 1}
                            onClick={() => handlePageChange(pagination.page + 1)}
                            className="page-btn"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
