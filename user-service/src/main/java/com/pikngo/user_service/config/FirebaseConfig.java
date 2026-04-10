package com.pikngo.user_service.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${firebase.config.path:}")
    private String configPath;

    @PostConstruct
    public void initialize() {
        if (configPath == null || configPath.isEmpty()) {
            log.warn("Firebase config path is NOT configured. Firebase features will be disabled.");
            return;
        }

        try {
            FileInputStream serviceAccount = new FileInputStream(configPath);

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                log.info("Firebase has been initialized successfully");
            }
        } catch (IOException e) {
            log.error("Failed to initialize Firebase from {}: {}", configPath, e.getMessage());
            log.warn("Firebase features will be disabled until valid service-account.json is provided");
        }
    }
}
