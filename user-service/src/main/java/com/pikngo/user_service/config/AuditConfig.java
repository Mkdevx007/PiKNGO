package com.pikngo.user_service.config;

import java.util.Optional;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Developer 4: Observability & Robustness
 * Auditing Configuration for tracking entity changes
 */
@Configuration
@EnableJpaAuditing
public class AuditConfig {

    /**
     * Provides the current auditor (user) for JPA auditing
     * Captures who made changes to entities (createdBy, modifiedBy)
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && 
                    !authentication.getPrincipal().equals("anonymousUser")) {
                return Optional.of(authentication.getName());
            }
            return Optional.of("System User");
        };
    }
}
