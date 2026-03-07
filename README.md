# PikNGo Project - Week 3 Phase

This phase focuses on enhancing authentication, finalizing address management, and introducing restaurant discovery features.

## 🚀 Team Assignments (5 Developers)

| Developer | Role | Assigned Task |
| :--- | :--- | :--- |
| **Developer 1 (mangal)** | **Leader & Fullstack** | **Login by Email & OTP**: Implement the end-to-end flow for email-based login with OTP verification on both Backend and Frontend. |
| **Developer 2 (javeed)** | **Backend** | **Address Management Refinement**: Ensure the `Address` table matches the schema and handle relational logic with the `User` table. |
| **Developer 3 (Abhishek)** | **Backend** | **Restaurant Infrastructure**: Create the `Restaurant` table and implement APIs for Create, Update, and Search (by Source/Destination). |
| **Developer 4 (Anand)** | **Frontend** | **Smart Dashboard**: Implement Geolocation access on the dashboard to show nearest restaurants. Fallback to all restaurants if access is denied. |
| **Developer 5 (Sudhran)** | **Frontend** | **Restaurant Discovery UI**: Build the Search and Filter interface for finding restaurants based on Source and Destination inputs. |

---

## 🛠️ Feature Requirements

### 1. Authentication Enhancement
- Implement `POST /api/v1/users/login/email-otp` (Send OTP to Email).
- Implement `POST /api/v1/users/verify/email-otp` (Verify OTP and Issue JWT).
- Update Frontend Login UI to support Email OTP option.

### 2. Address System (Backend)
Ensure the `addresses` table includes:
- `_id` (UUID), `address_line_1`, `address_line_2`, `city`, `state`, `pincode`, `user_id` (FK), `created_ts`, `modified_ts`, `is_deleted`.

### 3. Restaurant System
#### Backend APIs
- `POST /api/v1/restaurants`: Create restaurant.
- `PUT /api/v1/restaurants/{id}`: Update restaurant details.
- `GET /api/v1/restaurants/search`: Search by source/destination.

#### Restaurant Schema
- `_id`, `resturant_name`, `address`, `latitude`, `longitude`, `is_active`, `created_ts`, `modify_ts`, `is_deleted`.

#### Frontend Features
- **Location-Aware Dashboard**: Request GPS permissions; show nearest results first.
- **Search Filters**: Dynamic filtering based on route (source/destination).

---

## 📅 Getting Started
1. **Pull Latest**: `git pull origin main`
2. **Branching**: `feature/week3-your-task`
3. **Database**: Check `application.properties` and ensure `pikngo_user_db` is updated with new schemas.

