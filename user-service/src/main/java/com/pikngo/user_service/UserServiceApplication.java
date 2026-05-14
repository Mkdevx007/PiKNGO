package com.pikngo.user_service;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
@org.springframework.scheduling.annotation.EnableAsync
public class UserServiceApplication {

    private static final Logger log = LoggerFactory.getLogger(UserServiceApplication.class);

    @org.springframework.context.annotation.Bean
    public org.springframework.boot.CommandLineRunner dropRoleConstraintRunner(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;");
                log.info("Successfully dropped obsolete users_role_check constraint from database.");
            } catch (Exception e) {
                log.warn("Could not drop users_role_check constraint (might not exist): {}", e.getMessage());
            }
        };
    }

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
