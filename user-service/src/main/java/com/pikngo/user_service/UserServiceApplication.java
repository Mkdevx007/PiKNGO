package com.pikngo.user_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class UserServiceApplication {

	public static void main(String[] args) {
		System.out.println("Starting UserServiceApplication...");
		System.out.println("Current Working Directory: " + System.getProperty("user.dir"));

		io.github.cdimascio.dotenv.Dotenv dotenv = io.github.cdimascio.dotenv.Dotenv.configure()
				.directory("./")
				.ignoreIfMissing()
				.load();
		
		System.out.println("Loading environment variables from .env...");
		dotenv.entries().forEach(entry -> {
			if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
				System.setProperty(entry.getKey(), entry.getValue());
				System.out.println("Loaded: " + entry.getKey());
			}
		});

		SpringApplication.run(UserServiceApplication.class, args);
	}

}
