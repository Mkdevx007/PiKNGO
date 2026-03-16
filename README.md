# 🚗 PikNGo - Highway Food Discovery App

PikNGo is a modern, highway-focused food discovery platform designed to help travelers find the best dining options on their journey. Built with a premium UI/UX, it offers seamless authentication and robust restaurant management features.

---

## ✨ Key Features

### 🔐 Authentication System
- **Advanced Login Options**: Supports Password, Phone OTP (Simulated), and **Email OTP** (SMTP Integrated).
- **Secure Account Recovery**: Robust forgot/reset password flow via email.
- **Premium UI**: Glassmorphism design with smooth animations and dark/light theme support.

### 📍 Structured Address Management
- **Unified Schema**: Both user profiles and saved addresses use a consistent 5-field structure: `Address Line 1`, `Address Line 2`, `City`, `State`, and `Pincode`.
- **Flexible Profiles**: Easily manage primary and secondary locations for faster food discovery.

### 🍽️ Restaurant Service
- **Enterprise Ready**: Full tracking with `created_ts`, `modify_ts`, and `is_deleted` flags for complete auditability.
- **Secure API**: DTO-based architecture prevents sensitive data leakage and ensures JPA stability.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 17, Spring Boot 3, JPA/Hibernate, Spring Security |
| **Database** | PostgreSQL |
| **Frontend** | React.js, Lucide-React, Axios |
| **Integrations** | SMTP (Email OTP), Browser Geolocation |

---

## 📋 Prerequisites

Before running the project, ensure you have the following installed:
- **Java 17 or higher**
- **Node.js (LTS version)**
- **PostgreSQL 14+**
- **Maven** (optional, wrapper included)

---

## ⚙️ Configuration & Environment Setup

The project relies on environment variables for security and flexibility. Follow these steps to set up your local environment:

1. **Create Environment File**: 
   Copy the `.env.example` file to a new file named `.env` in the root directory.
   ```bash
   cp .env.example .env
   ```

2. **Configure Variables**:
   Open the `.env` file and fill in the following values:
   - `DB_PASSWORD`: Your local PostgreSQL password.
   - `MAIL_PASSWORD`: Your Google App Password for SMTP (used for OTP emails).
   - `VITE_ARCGIS_API_KEY`: Your ArcGIS developers API key for map services.
   - `VITE_API_BASE_URL`: Should be `http://localhost:8081/api/v1` for local development.

---

## 🚀 Getting Started

### ⚡ Unified Development Command
Run both the backend and frontend simultaneously with a single command:
```bash
npm run dev
```

### Manual Setup
#### Backend Setup
1. Navigate to `user-service/`.
2. Configure `application.properties` with your PostgreSQL and SMTP credentials.
3. Run `UserServiceApplication.java`.

### Frontend Setup
1. Navigate to `frontend/`.
2. Run `npm install`.
3. Start the development server: `npm run dev`.

---

## 📂 Project Structure
- `/user-service`: Spring Boot microservice handling users, authentication, and restaurant logic.
- `/frontend`: Modern React application with glassmorphism design.

---

## 🗺️ Roadmap
- [ ] Address Management System (Full UI Integration)
- [ ] Restaurant Discovery & Geolocation Enhancements
- [ ] Complete Order Flow Implementation
