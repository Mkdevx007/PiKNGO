# PikNGo Project

Welcome to the PikNGo Backend project. This repository contains the core services for the PikNGo application.

## 🚀 Team Collaboration Guidelines
This project is being developed by a team of **5 developers**. To ensure smooth collaboration, please follow these guidelines:

1.  **Branching Strategy**: Use feature branches (`feature/your-task-name`) and create Pull Requests.
2.  **Code Style**: Follow standard Java coding conventions. Use Lombok to reduce boilerplate.
3.  **Packages**: Follow the layered architecture (Controller -> Service -> Repository).
4.  **Database**: All schema changes should be documented in the `README.md` and eventually managed via Flyway/Liquibase (planned).

---

## 🛠️ User Service (Module)
The `user-service` handles all user-related operations including registration, login, and profile management.

### Tech Stack
- **Java 21**
- **Spring Boot 3.4.x** (Parent 4.0.3)
- **PostgreSQL**
- **Spring Data JPA**
- **Spring Security**
- **Lombok**

### Key Features
- **User Registration**: Captures Name, Email, Phone, Address, etc.
- **OTP Login**: Mobile number based authentication with 6-digit OTP.

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

## 👥 Current Task Assignments (Team of 5)

To ensure we don't overlap, each developer is assigned a specific module. Please check your name/role below:

| Developer | Module / Responsibility | Key Tasks |
| :--- | :--- | :--- |
| **Developer 1** | **Security & Auth** | Implement JWT tokens, Spring Security Filter, and secure endpoints. |
| **Developer 2** | **External Integrations**| Integrate real SMS Gateway (Twilio/AWS) into `AuthServiceImpl`. |
| **Developer 3** | **Profile Management** | Create endpoints for User Profile updates and Image/ID uploads. |
| **Developer 4** | **Observability** | Setup Global Exception Handler and API request/response logging (Auditing). |
| **Developer 5** | **QA & DevOps** | Write Unit/Integration tests and setup Docker/CI-CD pipeline. |

> [!NOTE]
> Please create a separate branch for your task: `feature/dev-N-task-name`.

---

## 🏗️ Developer Implementation Details

Each developer should focus on these specific layers/folders:

### 👤 Developer 1: Security & Auth
*   **Primary Folders**: `config/`, `utils/`, `controller/`
*   **What to do**:
    1.  Create `SecurityConfig.java` in `config/` to secure all `/api/v1/users/**` endpoints.
    2.  Implement JWT generation logic in `utils/JwtUtils.java`.
    3.  Update `UserController.verifyOtp` to return a JWT token in the response instead of just a success message.

### 🔌 Developer 2: External Integrations (Login Flow)
*   **Primary Folders**: `service/impl/`, `utils/`, `resources/`
*   **What to do**:
    1.  **Mobile + OTP Login**: Integrate a real SMS provider (e.g., Twilio) in `AuthServiceImpl.java` to send 6-digit OTPs.
    2.  Move dummy hardcoded values (API keys) to `application.properties`.
    3.  Create an `EmailService` if notification via email is also required.

### 📝 Developer 3: User Registration & Profile
*   **Primary Folders**: `entity/`, `dto/`, `controller/`, `service/`
*   **What to do**:
    1.  **Registration Fields**: Ensure the `User` entity and `UserRegistrationRequest` capture: **First Name, Last Name, Address, Phone Number, Email**. Add any other useful metadata fields.
    2.  Create `ProfileUpdateRequest` DTO for editing these fields later.
    3.  Add `PATCH /api/v1/users/profile` endpoint in `UserController`.

### 🛡️ Developer 4: Observability & Robustness
*   **Primary Folders**: `exception/`, `config/`
*   **What to do**:
    1.  Implement `GlobalExceptionHandler.java` in `exception/` to handle all errors (validation error, not found error, etc.) and return a consistent JSON response.
    2.  Enable JPA Auditing in `config/` to track who created/updated records.

### 🧪 Developer 5: QA & DevOps
*   **Primary Folders**: `src/test/java/...`, Root folder
*   **What to do**:
    1.  Write Integration Tests for the Registration and OTP flow in `src/test/java`.
    2.  Create a `Dockerfile` in the module root to containerize the service.
    3.  Setup a GitHub Actions workflow `.github/workflows/maven.yml` for automated builds.
