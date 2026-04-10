package com.pikngo.user_service;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class UserServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(UserServiceApplication.class);

    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
                log.debug("Loaded: {}", entry.getKey());
            }
        });

        log.info("Starting UserServiceApplication...");
        log.info("Current Working Directory: {}", System.getProperty("user.dir"));

        SpringApplication.run(UserServiceApplication.class, args);
    }
}
