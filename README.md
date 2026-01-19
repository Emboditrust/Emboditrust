# 🛡️ Secure QR Code Verification System

A high-performance, secure backend system for authenticating product QR codes, designed to prevent counterfeiting and track verification in real-time. Built for regulatory bodies, manufacturers, and brands needing reliable product authentication.

---

## ✨ Features

- **Instant Verification** – Serverless API responds in milliseconds
- **Military-Grade Security** – Bcrypt-hashed codes, one-time use logic, and audit logging
- **Fraud Detection** – Flags suspicious activity (geo-mismatch, brute force, reused codes)
- **Admin Dashboard** – Real-time analytics, maps, and code management
- **Scalable Architecture** – Ready for millions of verifications

---

## 🧠 How It Works

```mermaid
graph LR
    A[User Scans QR] --> B[API Request]
    B --> C{Database Lookup}
    C -->|Valid| D[Status: Active?]
    D -->|Yes| E[Mark as Used]
    E --> F[Return: GENUINE]
    D -->|No| G[Return: USED/FAKE]
    C -->|Invalid| H[Return: INVALID]
    F --> I[Log Attempt]
    G --> I
    H --> I
