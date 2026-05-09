# 🚗 PikNGo - Premium Highway Food Discovery Platform

<div align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.x-green?style=for-the-badge&logo=springboot" />
  <img src="https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/PostgreSQL-14%2B-blue?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" />
  <img src="https://img.shields.io/badge/Render-Backend-blueviolet?style=for-the-badge&logo=render" />

  ### 🌐 Live Links
  | Service | URL |
  |---|---|
  | 🖥️ **Frontend (Website)** | [https://pikngo.vercel.app](https://pikngo.vercel.app) |
  | ⚙️ **Backend (API)** | [https://pikngo-user-service.onrender.com](https://pikngo-user-service.onrender.com) |
</div>

---

## 🌟 Overview

**PikNGo** is a high-end, full-stack food discovery application specifically engineered for highway travelers. It bridges the gap between hungry travelers and the best highway eateries, offering a premium "Elite HUD" interface, secure multi-factor authentication, and a robust administrative backend.

> [!TIP]
> This project follows a microservice-ready architecture with a clean separation between the Java Spring Boot backend and the React-based frontend.

---

## ✨ Elite Features

### 🔐 Security & Authentication
- **Multi-Channel Login**: Choose between standard Password, Phone-based OTP (Simulated), or **Secure Email OTP** (SMTP Integrated).
- **Session Integrity**: Secure JWT-based authentication with HttpOnly cookies for maximum protection.
- **Password Recovery**: Automated forgot/reset password flows with unique token validation.

### 📍 Smart Discovery
- **Geospatial Awareness**: Integrated ArcGIS map services for real-time location tracking and restaurant discovery.
- **Unified Address System**: Standardized 5-field address schema (`Line1`, `Line2`, `City`, `State`, `Pincode`) for consistent delivery and profile management.
- **Trending Hub**: Discover what's hot on the highway based on real-time order data and user ratings.

### 🍱 Restaurant & Menu Management
- **Enterprise Controls**: Dedicated Admin Dashboard to manage users, restaurants, and global settings.
- **Dynamic Menus**: Real-time menu updates with availability toggles and pricing management.
- **Audit Trails**: Full system auditability using `created_ts`, `modify_ts`, and soft-delete (`is_deleted`) strategies.

---

## 🛠️ Technology Stack

### **Backend (The Engine)**
- **Framework**: Spring Boot 3.x
- **Language**: Java 17
- **Data Persistence**: Spring Data JPA with Hibernate
- **Database**: PostgreSQL 14+
- **Security**: Spring Security & JWT
- **Utility**: Lombok, Maven Wrapper

### **Frontend (The Interface)**
- **Framework**: React 18+ (Vite)
- **Styling**: Vanilla CSS with Glassmorphism & Elite HUD aesthetics
- **Routing**: React Router 6
- **State Management**: React Context (Auth, Theme, Cart, Toasts)
- **Icons**: Lucide React

---

## 🚀 Getting Started

### 📦 Prerequisites
- **Java 17** (Amazon Corretto or OpenJDK)
- **Node.js 18+** & **npm**
- **PostgreSQL** instance

### ⚙️ Environment Configuration

| Variable | Description | Default/Sample |
|---|---|---|
| `DB_URL` | PostgreSQL Connection String | `jdbc:postgresql://localhost:5432/pikngo_db` |
| `DB_USERNAME` | Database User | `postgres` |
| `DB_PASSWORD` | Database Password | `your_password` |
| `MAIL_USERNAME` | Gmail Address for SMTP | `user@gmail.com` |
| `MAIL_PASSWORD` | Google App Password | `abcd-efgh-ijkl-mnop` |
| `VITE_API_BASE_URL`| Backend API Endpoint | `http://localhost:8081/api/v1` |

### ⚡ Quick Start (Unified Dev)
From the root directory, run:
```bash
npm run dev
```

### 🔨 Manual Setup

#### 1. Backend Setup
```bash
cd user-service
# Update src/main/resources/application.properties with your credentials
./mvnw spring-boot:run
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📂 Project Structure

```text
├── user-service/        # Spring Boot Backend
│   ├── src/             # Source code (Controllers, Services, Models)
│   ├── Dockerfile       # Containerization config
│   └── pom.xml          # Maven dependencies
├── frontend/            # React Frontend
│   ├── src/             # Components, Pages, Contexts, Hooks
│   ├── public/          # Static assets
│   └── vercel.json      # Vercel deployment config
├── render.yaml          # Render.com blueprint for full-stack deployment
└── README.md            # You are here!
```

---

## 🌐 Deployment

- **Frontend**: Optimized for [Vercel](https://vercel.com).
- **Backend & DB**: Optimized for [Render](https://render.com) using the provided `render.yaml`.

---

## 🗺️ Roadmap
- [ ] **Phase 5**: Full AI-based food recommendation engine.
- [ ] **Phase 6**: Real-time order tracking with MapBox integration.
- [ ] **Phase 7**: Mobile App (PWA) transformation.

---
<div align="center">
  <b>Built with ❤️ by the PikNGo Team</b>
</div>