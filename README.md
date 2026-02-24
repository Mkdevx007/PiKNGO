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
- **Java 17** (LTS)
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

Each developer should focus on these specific layers/folders. I have created **starter stubs** for you to begin your work.

### 👤 Developer 1: Security & Auth
*   **Primary Files**: 
    - [SecurityConfig.java](file:///e:/intership/PikNGo/user-service/src/main/java/com/pikngo/user_service/config/SecurityConfig.java) (Implement FilterChain)
    - [JwtUtils.java](file:///e:/intership/PikNGo/user-service/src/main/java/com/pikngo/user_service/utils/JwtUtils.java) (Implement Token Logic)
*   **What to do**:
    1.  Update `SecurityConfig` to protect `/api/v1/users/**` as needed.
    2.  Implement JWT generation in `JwtUtils`.
    3.  Update `UserController.verifyOtp` to return a JWT token on success.

### 🔌 Developer 2: External Integrations (Login Flow)
*   **Primary Files**: 
    - [AuthServiceImpl.java](file:///e:/intership/PikNGo/user-service/src/main/java/com/pikngo/user_service/service/impl/AuthServiceImpl.java) (Integrate SMS)
    - [EmailService.java](file:///e:/intership/PikNGo/user-service/src/main/java/com/pikngo/user_service/service/EmailService.java) (Implement Interface)
*   **What to do**:
    1.  Integrate a real SMS provider (e.g., Twilio) in `AuthServiceImpl`.
    2.  Implement the `EmailService` for transactional emails.

### 📝 Developer 3: User Registration & Profile
*   **Primary Files**: 
    - [ProfileUpdateRequest.java](file:///e:/intership/PikNGo/user-service/src/main/java/com/pikngo/user_service/dto/ProfileUpdateRequest.java) (Add fields)
    - [UserController.java](file:///e:/intership/PikNGo/user-service/src/main/java/com/pikngo/user_service/controller/UserController.java) (Add profile endpoint)
*   **What to do**:
    1.  Add fields to `ProfileUpdateRequest`.
    2.  Add `PATCH /api/v1/users/profile` in `UserController` and implement in `UserService`.

### 🛡️ Developer 4: Observability & Robustness
*   **Primary Files**: 
    - [GlobalExceptionHandler.java](file:///e:/intership/PikNGo/user-service/src/main/java/com/pikngo/user_service/exception/GlobalExceptionHandler.java) (Add error handlers)
*   **What to do**:
    1.  Add specific handlers for validation and business errors.
    2.  Enable Auditing in a new `AuditConfig.java` (create this in `config/`).

### 🧪 Developer 5: QA & DevOps
*   **Primary Files**: 
    - [Dockerfile](file:///e:/intership/PikNGo/user-service/Dockerfile) (Refine for prod)
    - `src/test/java/...`
*   **What to do**:
    1.  Write Integration Tests for OTP flow.
    2.  Setup GitHub Actions for CI/CD.

---

## 🛠️ Getting Started (Step-by-Step for New Devs)

1. **Check Out**: `git checkout -b feature/your-name-task`
2. **Setup DB**: Create `pikngo_user_db` in Postgres.
3. **Build**: Run `./mvnw clean install` to ensure all stubs compile.
4. **Code**: Open your assigned "Primary Files" and start implementing!
