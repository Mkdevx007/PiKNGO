import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add interceptor for JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    register: (userData) => api.post('/users/register', userData),
    loginWithPassword: (credentials) => api.post('/users/login/password', credentials),
    sendOtp: (phoneNumber) => api.post(`/users/login/send-otp?phoneNumber=${phoneNumber}`),
    verifyOtp: (otpData) => api.post('/users/login/verify-otp', otpData),
    forgotPassword: (email) => api.post(`/users/forgot-password?email=${email}`),
    resetPassword: (token, newPassword) => api.post(`/users/reset-password?token=${token}&newPassword=${newPassword}`),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (profileData) => api.patch('/users/profile', profileData),
    deleteProfile: (softDelete = true) => api.delete(`/users/delete?softDelete=${softDelete}`),
    getAddresses: (userId) => api.get(`/users/${userId}/addresses`),
    addAddress: (userId, addressData) => api.post(`/users/${userId}/addresses`, addressData),
    updateAddress: (userId, addressId, addressData) => api.put(`/users/${userId}/addresses/${addressId}`, addressData),
    deleteAddress: (userId, addressId) => api.delete(`/users/${userId}/addresses/${addressId}`),
    forgotPassword: (email) => api.post(`/users/forgot-password?email=${email}`),
};

export default api;
