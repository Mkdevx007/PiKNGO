import React, { useState } from 'react';
import { Mail, Key, Lock, ArrowRight, ChevronLeft, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import OtpInput from './OtpInput';

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
            onSuccess('A 6-digit code has been sent to your email.');
            setShowReset(true);
        } catch (err) {
            onError(err.response?.data?.message || 'Failed to send reset code.');
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
            <Link to="/" className="auth-close-btn" title="Back to Home">
                <X size={20} />
            </Link>
            <h2 className="auth-title">{showReset ? 'Set New Password' : 'Forgot Password?'}</h2>
            <p className="auth-subtitle">
                {showReset
                    ? 'Check your email for the reset code and enter it below.'
                    : 'Enter your email and we\'ll send you a code to reset your password.'}
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
                        <label>Reset Code</label>
                        <OtpInput 
                            length={6} 
                            value={resetToken} 
                            onChange={setResetToken}
                            disabled={loading}
                        />
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
                    <button type="button" className="btn-secondary w-full" onClick={() => setShowReset(false)}>
                        Back
                    </button>
                </form>
            )}
        </div>
    );
};

export default ForgotPasswordForm;
