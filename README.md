# PikNGo Project

Welcome to the PikNGo Backend project. This repository contains the core services for the PikNGo application.

## 🚀 Team Collaboration Guidelines
This project is being developed by a team of **5 developers**. To ensure smooth collaboration, please follow these guidelines:

1.  **Branching Strategy**: Use feature branches (`feature/your-task-name`) and create Pull Requests.
2.  **Code Style**: Follow standard Java coding conventions. Use Lombok to reduce boilerplate.
3.  **Packages**: Follow the layered architecture (Controller -> Service -> Repository).
4.  **Database**: All schema changes should be documented in the `README.md` and eventually managed via Flyway/Liquibase (planned).

---

## 🌟 Current Project Status

The essential foundational core of the **user-service** is now **fully complete**.
All initial tasks covering Authentication, Observability, CI/CD, Profile Management, and QA have been thoroughly implemented by the team and merged into the main implementation. New features include:
- **Authentication:** Firebase SMS OTP verification with a flexible Backend Fallback and JWT-based Stateless Session Management.
- **Observability:** Centralized `AuditInterceptor` for execution time logging, Custom Exceptions (`InvalidOtpException`, `UserNotFoundException`, etc.), and JPA Auditing.
- **CI/CD & Testing:** Automated GitHub Actions workflows, provided a production-ready `Dockerfile`, and Integration Test suites covering Controllers and Services.
- **Data Transfer Objects:** Introduction of `ApiResponse` DTO to standardize frontend-backend JSON communication.

---

## 🛠️ User Service (Module)
The `user-service` handles all user-related operations including registration, login, and profile management.

### Tech Stack
- **Java 17** (LTS)
- **Spring Boot 3.4.3** (Stable)
- **PostgreSQL**
- **Spring Data JPA**
- **Spring Security**
- **Lombok**
- **Firebase Admin SDK**

### Key Features
- **User Registration**: Captures Name, Email, Phone, Address, etc.
- **Dual OTP Login**: Supports both **Firebase Phone Auth** and a **Backend-driven Local OTP fallback**.
- **JPA Auditing**: Automatic tracking of `created_by` and `last_modified_by` for all managed entities.
- **Automated CI/CD**: GitHub Actions workflow for automated builds and testing.

### Folder Structure
```text
src/main/java/com/pikngo/user_service/
├── config/        # Security, Beans, and App configurations
├── controller/    # REST API Endpoints
├── dto/           # Data Transfer Objects (Request/Response)
├── entity/        # Database Entities (JPA Models)
├── exception/     # Custom Exception classes & Global Exception Handler
├── mapper/        # DTO to Entity mappers
├── repository/    # Spring Data JPA Repositories
├── service/       # Business Logic Interfaces and Implementations
└── utils/         # Utility classes (OTP generator, etc.)
```

### 💡 Why this Architecture?
This structure is chosen for several professional reasons:
- **Parallel Development**: Since 5 developers are working together, the **Layered Architecture** (Controller -> Service -> Repository) ensures that everyone can work on their assigned layer without messing up others' code.
- **Scalability**: Separating logic from API and Database makes it easy to add new features or change providers (e.g., swapping SMS gateways) in the future.
- **Maintenance**: Finding bugs is faster when you know exactly which folder holds the relevant logic.
- **Industry Standard**: This follows the official Spring Boot recommendations, making the project "Enterprise Ready."

### Database Setup
1.  Install **PostgreSQL**.
2.  Create a database named `pikngo_user_db`.
3.  Update `user-service/src/main/resources/application.properties` with your credentials:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5432/pikngo_user_db
    spring.datasource.username=your_username
    spring.datasource.password=your_password
    ```

> [!TIP]
> If the application fails to start with a "Connection Refused" error, please ensure your PostgreSQL service is running and the database `pikngo_user_db` has been created.

### How to Run
1.  Navigate to `user-service` directory.
2.  Run `./mvnw spring-boot:run`

---

## 📝 SQL Schema
To create the necessary tables, run the following queries in your PostgreSQL terminal:

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- OTP Table
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) NOT NULL,
    otp_code VARCHAR(6) NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT FALSE
);
```

---

## � Getting Started for the Team (Next Steps)

If you are one of the **5 developers** joining this project, please follow these steps to start your work:

1.  **Clone the Repo**: `git clone https://github.com/Mkdevx006/PikNGo.git`
2.  **Stay Updated**: Run `git pull origin main` frequently to get the latest base changes.
3.  **Local Setup**: Follow the [Database Setup](#database-setup) steps to ensure the app runs on your machine.
4.  **Pick your Task**: Check the [Task Assignments](#-current-task-assignments-team-of-5) table below.
5.  **Create a Branch**: Always work on a separate branch, e.g., `feature/dev3-registration-fields`.

---

## �👥 Current Task Assignments (Team of 5)

To ensure we don't overlap, each developer is assigned a specific module. Please check your name/role below:

| Developer | Role | Status |
| :--- | :--- | :--- |
| **Developer 1 (mangal)** | **Security & Auth** | ✅ **COMPLETED** |
| **Developer 2 (javeed)** | **External Integrations**| ✅ **COMPLETED** |
| **Developer 3 (Abhishek)** | **Profile Management** | ✅ **COMPLETED** |
| **Developer 4 (Anand)** | **Observability** | ✅ **COMPLETED** |
| **Developer 5 (Sudhran)** | **QA & DevOps** | ✅ **COMPLETED** |

> [!NOTE]
> Please create a separate branch for your task: `feature/dev-N-task-name`.

---

## 🏗️ Developer Implementation Details

Each developer should focus on these specific layers/folders. I have created **starter stubs** for you to begin your work.

### 👤 Developer 1: Security & Auth (mangal)
- [x] Implemented **JWT Token** generation and validation.
- [x] Configured **Spring Security** for stateless authentication.
- [x] Created `JwtRequestFilter` for token verification on protected routes.

### 🔌 Developer 2: External Integrations (javeed)
- [x] Integrate a real SMS provider (Firebase/SmsService) in `AuthServiceImpl`.
- [x] Implement the `EmailService` for transactional emails.
- [x] Added **Backend OTP Fallback** system.

### 📝 Developer 3: User Registration & Profile (Abhishek)
- [x] Added `PATCH /api/v1/users/profile` in `UserController`.
- [x] Implemented user profile update logic.

### 🛡️ Developer 4: Observability & Robustness (Anand)
- [x] Implemented **Global Exception Handler** with specific error mapping.
- [x] Enabled **JPA Auditing** to track record modifications.
- [x] Created `AuditInterceptor` for detailed request logging and performance tracking.
- [x] Implemented `ApiResponse` wrapper for standardized JSON responses.

### 🧪 Developer 5: QA & DevOps (Sudhran)
- [x] Wrote Integration Tests using Test containers/MockMvc and externalized Test Configurations.
- [x] Created production-ready `Dockerfile` and configured GitHub Actions for CI/CD.

---

---

## 📅 Week 2 Tasks: Address Management, Login & Profile Enhancements

The focus for **Week 2** is to expand the `user-service` by adding robust address management capabilities, enhancing user profiles with soft/hard delete functionality, and introducing a standard login mechanism using email/phone and password combinations.

### 👤 Developer 1: Database Schema & Entities
- [ ] Add `is_deleted` and `user_password` columns to the `User` entity.
- [ ] Remove `address` column from the `User` entity.
- [ ] Create `Address` entity with mapping to `User` (_id, address_line_1, address_line_2, city, state, pincode, created_ts, modified_ts, is_deleted).
- [ ] Establish `OneToMany` relationship from `User` to `Address`.

### 🔌 Developer 2: Login API Implementation
- [ ] Create `POST /api/v1/users/login` endpoint.
- [ ] Support login via `email` OR `phone_number` and `password`.
- [ ] Integrate BCrypt for secure password hashing and verification.
- [ ] Issue JWT token upon successful authentication.

### 📝 Developer 3: Update Profile API
- [ ] Update `PATCH /api/v1/users/profile` endpoint.
- [ ] Allow users to update their personal details (email, phone, name).
- [ ] Handle password update requests securely.

### 🛡️ Developer 4: Address Management APIs
- [ ] Create `AddressRepository` and `AddressService`.
- [ ] Implement APIs to add, update, and remove addresses for a user (`/api/v1/users/{userId}/addresses`).
- [ ] Ensure cascaded saves from `User` updates handle address lists correctly.

### 🧪 Developer 5: Delete Profile API
- [ ] Create `DELETE /api/v1/users/delete` endpoint.
- [ ] Accept `softDelete=true/false` query parameter.
- [ ] Implement soft delete (set `is_deleted = true` for User and associated Addresses).
- [ ] Implement hard delete (permanently remove records from DB).

---

## 🛠️ Getting Started (Step-by-Step for New Devs)

1. **Check Out**: `git checkout -b feature/your-name-task`
2. **Setup DB**: Create `pikngo_user_db` in Postgres.
3. **Build**: Run `./mvnw clean install` to ensure all stubs compile.
4. **Code**: Open your assigned "Primary Files" and start implementing!
