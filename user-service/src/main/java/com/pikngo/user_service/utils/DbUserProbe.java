package com.pikngo.user_service.utils;

import com.pikngo.user_service.repository.AddressRepository;
import com.pikngo.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DbUserProbe {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void dumpUsers() {
        log.info("=== DB USER DUMP START ===");
        userRepository.findAll().forEach(u -> {
            log.info("DB USER CHECK: [UserID: {}, Name: {} {}, Email: {}, Phone: {}, City: {}, State: {}, Pincode: {}, Deleted: {}]",
                    u.getId(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getPhoneNumber(), u.getCity(), u.getState(), u.getPincode(), u.isDeleted());
        });
        log.info("=== DB USER DUMP END ===");

        log.info("=== DB SCHEMA CHECK START (Table: users) ===");
        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
            columns.forEach(col -> log.info("COLUMN: {}", col.get("column_name")));
        } catch (Exception e) {
            log.error("Failed to check schema: {}", e.getMessage());
        }
        log.info("=== DB SCHEMA CHECK END ===");

        log.info("=== DB ADDRESS DUMP START ===");
        addressRepository.findAll().forEach(a -> {
            log.info("DB ADDRESS CHECK: [ID: {}, UserID: {}, Address1: {}, City: {}, Pincode: {}]",
                    a.getId(), a.getUser().getId(), a.getAddressLine1(), a.getCity(), a.getPincode());
        });
        log.info("=== DB ADDRESS DUMP END ===");
    }
}
