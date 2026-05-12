package com.pikngo.user_service.service;

import java.util.Map;

public interface NotificationService {
    /**
     * Send a push notification to a specific user
     * @param userId The UUID of the user
     * @param title Notification title
     * @param body Notification body
     * @param data Optional data payload
     */
    void sendNotification(String userId, String title, String body, Map<String, String> data);
    
    /**
     * Send a notification to a specific FCM token
     * @param token The FCM registration token
     * @param title Notification title
     * @param body Notification body
     * @param data Optional data payload
     */
    void sendToToken(String token, String title, String body, Map<String, String> data);
}
