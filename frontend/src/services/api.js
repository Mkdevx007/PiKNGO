import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL || 'http://localhost:8081/api/v1',
    withCredentials: true,
});

// Token in cookie is handled automatically by the browser withCredentials: true
api.interceptors.response.use(
    (response) => {
        // If the response follows the ApiResponse format { success, message, data }
        if (response.data && Object.prototype.hasOwnProperty.call(response.data, 'success')) {
            if (response.data.success) {
                return response.data.data; // Return just the data part to the caller
            } else {
                return Promise.reject(new Error(response.data.message || 'API Error'));
            }
        }
        return response.data;
    },
    (error) => {
        // Extract backend error message if available
        const backendMessage = error.response?.data?.message || error.response?.data?.error;
        if (backendMessage) {
            return Promise.reject(new Error(backendMessage));
        }
        return Promise.reject(error);
    }
);

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
    changePassword: (data) => api.post('/users/change-password', data),
    getUsers: () => api.get('/users/all'),
    updateStatus: (userId, active) => api.patch(`/users/${userId}/status?active=${active}`),
    updateRole: (userId, role) => api.patch(`/users/${userId}/role?role=${role}`),
    adminDeleteUser: (userId) => api.delete(`/users/admin/${userId}`),
};

export const restaurantApi = {
    getAll: () => api.get('/restaurants'),
    getAllAdmin: () => api.get('/restaurants/admin/all'),
    getById: (id) => api.get(`/restaurants/${id}`),
    getNearby: (lat, lon, radius = 100) => api.get(`/restaurants/nearby?lat=${lat}&lon=${lon}&radius=${radius}`),
    searchByRoute: (srcLat, srcLon, destLat, destLon, radius = 100) =>
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
    getAllOrders: (page = 0, size = 10) => api.get(`/orders/all?page=${page}&size=${size}`),
    updateStatus: (orderId, status) => api.patch(`/orders/${orderId}/status?status=${status}`),
    updateAddress: (orderId, address) => api.patch(`/orders/${orderId}/address?address=${address}`),
    getTrending: (limit = 30) => api.get(`/orders/trending?limit=${limit}`),
};

export const adminSettingsApi = {
    getGlobalSettings: () => api.get('/admin/settings/global'),
    updateGlobalSettings: (data) => api.put('/admin/settings/global', data),
    getPromotions: () => api.get('/admin/settings/promotions'),
    createPromotion: (data) => api.post('/admin/settings/promotions', data),
    updatePromotion: (id, data) => api.put(`/admin/settings/promotions/${id}`, data),
    deletePromotion: (id) => api.delete(`/admin/settings/promotions/${id}`),
};

export const adminAnalyticsApi = {
    getDashboardStats: () => api.get('/admin/analytics/dashboard'),
};

export const reviewApi = {
    submit: (userId, data) => api.post(`/reviews/user/${userId}`, data),
    getRestaurantReviews: (restaurantId) => api.get(`/reviews/restaurant/${restaurantId}`),
    getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
};

export const paymentApi = {
    createOrder: (amount) => api.post('/payment/create-order', { amount }),
    verifyPayment: (paymentData) => api.post('/payment/verify', paymentData),
};

export default api;
