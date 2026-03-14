import React, { useState } from 'react';
import { Mail, Key, Lock, ArrowRight } from 'lucide-react';
import { authApi } from '../../services/api';

const ForgotPasswordForm = ({ onSuccess, onError, loading, setLoading, onBack }) => {
    const [forgotEmail, setForgotEmail] = useState('');
    const [showReset, setShowReset] = useState(false);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        onError('');
        try {
            await authApi.forgotPassword(forgotEmail);
            onSuccess('Reset token sent to your email! (Check backend logs)');
            setTimeout(() => {
                onSuccess('');
                setShowReset(true);
            }, 2000);
        } catch (err) {
            onError(err.response?.data?.message || 'Failed to send reset link.');
        } finally { setLoading(false); }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        onError('');
        try {
            await authApi.resetPassword(resetToken, newPassword);
            onSuccess('Password reset successful! You can now login.');
            setTimeout(() => {
                onBack(); // Go back to login
                onSuccess('');
            }, 3000);
        } catch (err) {
            onError(err.response?.data?.message || 'Failed to reset password.');
        } finally { setLoading(false); }
    };

    return (
        <div className="auth-card-content">
            <h2 className="auth-title">{showReset ? 'Set New Password' : 'Forgot Password?'}</h2>
            <p className="auth-subtitle">
                {showReset
                    ? 'Enter the token from your email and your new password.'
                    : 'Enter your email and we\'ll send you a link to reset your password.'}
            </p>

            {!showReset ? (
                <form className="auth-form" onSubmit={handleForgotSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                            <Mail size={18} className="input-icon" />
                            <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="name@example.com" required />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? <div className="loader"></div> : 'Send Reset Link'}
                    </button>
                    <button type="button" className="btn-secondary w-full" onClick={onBack}>
                        Back to Login
                    </button>
                </form>
            ) : (
                <form className="auth-form" onSubmit={handleResetSubmit}>
                    <div className="form-group">
                        <label>Reset Token</label>
                        <div className="input-wrapper">
                            <Key size={18} className="input-icon" />
                            <input type="text" value={resetToken} onChange={(e) => setResetToken(e.target.value)} placeholder="Paste token here" required />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>New Password</label>
                        <div className="input-wrapper">
                            <Lock size={18} className="input-icon" />
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 8 characters" required />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full" disabled={loading}>
                        {loading ? <div className="loader"></div> : 'Reset Password'}
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgotPasswordForm;
