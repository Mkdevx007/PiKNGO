package com.pikngo.user_service.service.impl;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.pikngo.user_service.entity.User;
import com.pikngo.user_service.repository.UserRepository;
import com.pikngo.user_service.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
public class FcmServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(FcmServiceImpl.class);
    private final UserRepository userRepository;

    public FcmServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void sendNotification(String userId, String title, String body, Map<String, String> data) {
        userRepository.findById(UUID.fromString(userId)).ifPresent(user -> {
            String token = user.getFcmToken();
            if (token != null && !token.isEmpty()) {
                sendToToken(token, title, body, data);
            } else {
                log.warn("User {} does not have an FCM token registered", userId);
            }
        });
    }

    @Override
    public void sendToToken(String token, String title, String body, Map<String, String> data) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(token)
                    .setNotification(notification);

            if (data != null) {
                messageBuilder.putAllData(data);
            }

            Message message = messageBuilder.build();
            String response = FirebaseMessaging.getInstance().send(message);
            log.info("Successfully sent message: " + response);
        } catch (Exception e) {
            log.error("Error sending FCM message: " + e.getMessage());
        }
    }
}
