# PikNGo Project Implementation Summary (Updated)

This document summarizes the features, technologies, and changes implemented in the latest development cycle.

## 1. Features Implemented

### **Structured Address System**
- **Unified Logic**: Both the `User` table and the separate `Address` table now use a consistent 5-field structure: `address_line_1`, `address_line_2`, `city`, `state`, and `pincode`.
- **Database**: 
    - `users` table now has structured address columns instead of a single generic text field.
    - `addresses` table (separate) stores additional saved locations for the user.
- **Naming Consistency**: All primary keys are now named `_id` in the database to match requested conventions. Timestamps follow the `created_ts` and `modified_ts`/`modify_ts` (for restaurants) naming.

### **Authentication & Profile**
- **Registration**: Users can provide their primary address components during the registration process.
- **Profile Management**: Profile screen allows viewing and editing of individual address components (City, State, Pincode, etc.) instead of a bulk address string.

### **Restaurant Service**
- **DTO-Based API**: All restaurant operations use DTOs to protect sensitive data and prevent JPA issues.
- **Audit Ready**: Full tracking with `created_ts`, `modify_ts`, and `is_deleted` flags.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17, Spring Boot 3, JPA/Hibernate, Spring Security |
| **Database** | PostgreSQL |
| **Frontend** | React.js, Lucide-React, Axios |
| **Integrations** | SMTP (Email OTP), Browser Geolocation |

---

## 3. Database Schema (Corrected)

```sql
-- Users Table
CREATE TABLE users (
    _id UUID PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(100),
    phone_number VARCHAR(15),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    created_ts TIMESTAMP,
    modified_ts TIMESTAMP
);

-- Addresses Table
CREATE TABLE addresses (
    _id UUID PRIMARY KEY,
    address_line_1 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    user_id UUID REFERENCES users(_id),
    created_ts TIMESTAMP,
    modified_ts TIMESTAMP
);
```
