# 📜 agroProd - System Knowledge Base (Source of Truth)

This document serves as the central repository of architectural decisions, business rules, and technical specifications for the **agroProd** system. It is designed to provide long-term memory for AI agents and developers to ensure consistency and structural integrity across all future iterations.

---

## 1. 🌐 Project General Information

- **Project Name:** `agroProd`
- **Original Purpose:** Initially conceived as an academic requirement for "Programación II," developed as a classic MVC monolith (Express + Templates).
- **Current Production Architecture:** The system has been completely redesigned into a decoupled architecture:
    - **Backend:** Native TypeScript REST API.
    - **Frontend:** Single Page Application (SPA) developed with Angular.

---

## 2. 💻 Current Development Environment

- **Operating System:** Windows (PowerShell).
- **Infrastructure & Database:** 
    - **Server:** Laragon.
    - **Database:** MySQL (running on port `3306` with password protection).
- **Runtime & Language:** 
    - **Node.js:** v26.
    - **TypeScript:** v6.x.
    - **Hot-Reloading:** Managed via `ts-node-dev` through the `npm run dev` script.
- **ORM:** **Prisma (v7.8.0)**. Currently initialized, synchronized with applied migrations, and client generated.
- **Recommended Editor Setup (VS Code):**
    - Prisma
    - Angular Language Service
    - Thunder Client (API Testing)
    - MySQL (cweijan)
    - ESLint & Prettier

---

## 3. 📦 Backend Stack & Dependencies

The backend implementation is strictly based on the following key modules defined in `package.json`:

| Module | Version | Purpose |
| :--- | :--- | :--- |
| `express` | v5.x | Web framework for the REST API. |
| `@prisma/client` | v7.8.0 | Type-safe database access layer. |
| `bcrypt` | Latest | Password hashing and credential cryptography. |
| `jsonwebtoken` | Latest | JWT-based authentication and authorization. |
| `cors` | Latest | Cross-Origin Resource Sharing security. |
| `dotenv` | Latest | Environment variable management. |

---

## 4. 🛠 Business Rules & System Scope

The system manages the national registry of agricultural producers in Venezuela.

### 📍 Geographical Hierarchy
Strict hierarchical structure for location tracking:
`Estado` $
ightarrow$ `Municipio` $
ightarrow$ `Parroquia` $
ightarrow$ `Sector / Coordinates`.

### 🧑‍🌾 Producers
- Management of personal data and activity status (`Active` / `Inactive`).
- Ability to generate filtered lists and reports.

### 🏡 Farms (Predios)
- A single producer can own multiple farms/plots distributed across different geographic locations.

### 🐄 Livestock Brands (Critical Rule)
**Constraint:** A producer can possess **ONLY ONE** unique livestock brand (marca de herrar).

- **Visual Component:** The brand must be stored/represented as a PNG image.
- **Input Methods:** 
    - Integrated drawing canvas in the client.
    - Direct PNG file upload.
- **Constraints:** Strict control over allowed resolutions and image sizes.
- **Duplicate Prevention (Security):** The backend **must** implement a validation system to ensure uniqueness. This involves rejecting identical or duplicate brands using techniques such as:
    - Image hashing.
    - Pattern evaluation.
    - Pixel-by-pixel matching.

---

## ⚠️ Update Protocol for AI Agents

**IMPORTANT:** To maintain this file as the "Source of Truth," the following trigger events **MUST** result in an immediate update to `gemini.md`:

1. **API Evolution:** Creation or modification of any API route.
2. **Data Model Changes:** Any modification to the `schema.prisma` file or new migrations.
3. **Frontend Expansion:** Addition of new modules, services, or critical components in Angular.
4. **Dependency Changes:** Installation of new libraries or major version upgrades in `package.json`.

*Always reflect the current state of the software to avoid architectural drift.*

