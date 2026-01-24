# 🧺 M Laundromat v2.0 - Smart Laundry Management System

![Project Status](https://img.shields.io/badge/Status-Active_Development-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Stack](https://img.shields.io/badge/Stack-MERN-indigo)
![AI](https://img.shields.io/badge/AI-Gemini_1.5_Flash-orange)

> A modern, full-stack solution to digitize laundromat operations. Now powered by **Google Gemini AI** for instant customer support and automated price calculations.

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [AI & Integrations](#-ai--integrations-new)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [Future Roadmap](#-future-roadmap)

---

## 🚀 Overview

**M Laundromat v2** is a web-based platform designed to streamline the daily workflow of a laundry business. Unlike traditional POS systems, this application creates a synchronized ecosystem:

1.  **Customers** can track their laundry progress real-time and chat with **M Bot** (AI Assistant) for instant quotes.
2.  **Staff** use a POS interface to create orders, assign machines, and manage the queue.
3.  **Admins** manage revenue, machine health, and configure global system pricing via the Settings panel.

---

## ✨ Key Features

### 👤 For Customers

- **🤖 AI Chat Assistant (M Bot):** Instant answers regarding pricing and services (Powered by Gemini 1.5 Flash).
- **Real-Time Tracking:** View status updates (Queued, Washing, Drying, Ready) live.
- **Mobile Responsive:** Fully optimized mobile dashboard with a native-app feel.
- **Profile Management:** Manage contact details for seamless POS linking.

### 🏪 For Staff (POS)

- **Quick Order Creation:** Calculate prices based on weight (kg) or load type automatically.
- **Machine Linking:** Assign specific washers/dryers to customer orders.
- **Queue Management:** Handle walk-ins and drop-offs efficiently.
- **Receipts:** Generate digital order summaries.

### 🛡️ For Admins

- **Dynamic Pricing Engine:** Update Wash/Dry/Full-Service rates instantly via the Settings tab.
- **Telegram Monitoring:** Receive real-time logs of all AI-Customer interactions directly to your phone.
- **Dashboard Analytics:** Visualize revenue, active loads, and customer growth.
- **User Management:** Add/Remove Staff and manage permissions.
- **Machine Management:** Monitor machine status (Available, In Use, Maintenance).
- **Inventory Tracking:** Track detergent/softener stock and get low-stock alerts.

---

## 🤖 AI & Integrations (New)

The system now features **M Bot**, a smart assistant embedded in the Landing Page and Customer Dashboard.

1.  **Google Gemini 1.5 Flash:**
    - The "Brain" of the chatbot.
    - Context-aware: It knows the _current_ prices set in the Admin Database.
    - Sanitized inputs to ensure it only discusses laundry-related topics.

2.  **Telegram Bot API:**
    - **Admin Logging:** Every conversation user has with the AI is logged and forwarded to the Admin's Telegram chat for monitoring purposes.

---

## 🛠 Tech Stack

### Frontend

- **Framework:** React.js (v18+)
- **Styling:** Tailwind CSS (Mobile-First Design)
- **State Management:** React Context API
- **Routing:** React Router v6 (Lazy Loading & Protected Routes)
- **Icons:** Lucide React
- **HTTP Client:** Axios

### Backend

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Authentication:** JWT (JSON Web Tokens) & Bcrypt
- **Email Service:** Nodemailer (Gmail SMTP)

---

## 📸 Screenshots

|                Landing Page                |            Admin Dashboard             |
| :----------------------------------------: | :------------------------------------: |
| ![Landing Page](./screenshots/landing.png) | ![Admin Dash](./screenshots/admin.png) |

|              Staff POS              |               Customer Tracking               |
| :---------------------------------: | :-------------------------------------------: |
| ![Staff POS](./screenshots/pos.png) | ![Customer Track](./screenshots/customer.png) |

---

## ⚡ Installation & Setup

Follow these steps to run the project locally.

### Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (Local or Atlas URL)
- Google Gemini API Key
- Telegram Bot Token & Chat ID

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/m-laundromat-v2.git](https://github.com/your-username/m-laundromat-v2.git)
cd m-laundromat-v2
```
