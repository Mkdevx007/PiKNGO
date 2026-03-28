import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Token in cookie is handled automatically by the browser withCredentials: true

export const authApi = {
    register: (userData) => api.post('/users/register', userData),
    loginWithPassword: (credentials) => api.post('/users/login/password', credentials),
    sendOtp: (phoneNumber) => api.post(`/users/login/send-otp?phoneNumber=${phoneNumber}`),
    verifyOtp: (otpData) => api.post('/users/login/verify-otp', otpData),
    sendEmailOtp: (email) => api.post(`/users/login/send-email-otp?email=${email}`),
    forgotPassword: (email) => api.post(`/users/forgot-password?email=${email}`),
    resetPassword: (token, newPassword) => api.post(`/users/reset-password?token=${token}&newPassword=${newPassword}`),
    getProfile: () => api.get('/users/profile'),
    updateProfile: (userData) => api.patch('/users/profile', userData),
    uploadProfilePhoto: (formData) => api.post('/users/profile/photo', formData),
    deleteProfile: (softDelete = true) => api.delete(`/users/delete?softDelete=${softDelete}`),
    logout: () => api.post('/users/logout'),
    getUsers: () => api.get('/users/all'),
};

export const restaurantApi = {
    getAll: () => api.get('/restaurants'),
    getAllAdmin: () => api.get('/restaurants/admin/all'),
    getById: (id) => api.get(`/restaurants/${id}`),
    getNearby: (lat, lon, radius = 100) => api.get(`/restaurants/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),
    searchByRoute: (srcLat, srcLon, destLat, destLon, radius = 50) =>
        api.get(`/restaurants/search?srcLat=${srcLat}&srcLon=${srcLon}&destLat=${destLat}&destLon=${destLon}&radius=${radius}`),

    create: (data) => api.post('/restaurants', data),
    update: (id, data) => api.put(`/restaurants/${id}`, data),
};

export const menuApi = {
    getMenu: (restaurantId) => api.get(`/restaurants/${restaurantId}/menu`),
    addItem: (restaurantId, data) => api.post(`/restaurants/${restaurantId}/menu`, data),
    updateItem: (restaurantId, itemId, data) => api.put(`/restaurants/${restaurantId}/menu/${itemId}`, data),
    deleteItem: (restaurantId, itemId) => api.delete(`/restaurants/${restaurantId}/menu/${itemId}`),
};

export const addressApi = {
    getAll: () => api.get('/addresses'),
    create: (data) => api.post('/addresses', data),
    update: (id, data) => api.put(`/addresses/${id}`, data),
    delete: (id) => api.delete(`/addresses/${id}`),
};

export const orderApi = {
    placeOrder: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders/my-orders'),
    getRestaurantOrders: (restaurantId) => api.get(`/orders/restaurant/${restaurantId}`),
    getAllOrders: () => api.get('/orders/all'),
    updateStatus: (orderId, status) => api.patch(`/orders/${orderId}/status?status=${status}`),
};

export default api;

