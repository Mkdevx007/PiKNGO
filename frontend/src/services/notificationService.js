import { authApi } from './api';

export const requestNotificationPermission = async () => {
    try {
        if (!('Notification' in window)) {
            console.warn("This browser does not support notifications.");
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.warn("Notification permission denied.");
            return null;
        }

        // Note: Real Firebase messaging requires firebase-messaging-sw.js
        // For this demo, we'll simulate the token registration
        // In a real app, you'd use getToken(messaging, { vapidKey: '...' })
        const mockFcmToken = "fcm_token_mock_" + Math.random().toString(36).substring(7);
        
        // Register token with backend
        await authApi.updateProfile({ fcmToken: mockFcmToken });
        console.log("FCM Token registered:", mockFcmToken);
        
        return mockFcmToken;
    } catch (err) {
        console.error("Failed to register for notifications:", err);
        return null;
    }
};

export const showLocalNotification = (title, body) => {
    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3448/3448609.png'
        });
    }
};
