# Esports Tournament Assistance - Tournament Management Engine

A full-stack web application designed to orchestrate and manage community and professional Esports tournaments with dynamic drafting workflows.

## Project Overview

Esports Tournament Engine is a comprehensive platform built to streamline competitive gaming events, featuring:

* **Tournament Dashboard:** Centralized interface for team registrations, participant management, and automated bracket progression.
* **Dynamic Drafting Workflow:** Interactive, real-time Map and Agent Ban/Pick system tailored specifically for Valorant-style competitive matches.
* **Structured Business Logic:** Robust handling of tournament lifecycle states, match scores, and real-time synchronization between players and organizers.
* **Admin Control Center:** Dedicated tools for match configuration, rule enforcement, and live status monitoring.

## Technology Stack

### Backend

* **Framework:** Spring Boot 3.2.0
* **Language:** Java 17
* **Database:** Microsoft SQL Server
* **ORM:** Spring Data JPA
* **Real-time Communication:** Spring WebSockets (STOMP)

### Frontend

* **Framework:** React 19
* **Build Tool:** Vite
* **HTTP Client:** Axios
* **Styling:** Tailwind CSS

## Project Structure

```text
├── Backend/
│   └── src/main/java/com/tournament/engine/
│       ├── config/           # WebSocket, Security, and Database configurations
│       ├── shared/           # Shared DTOs, custom exceptions, and utility classes
│       └── modules/
│           ├── tournament/   # Entities, Repositories, Services, and Controllers for tournament management
│           ├── drafting/     # Core logic and WebSocket message handling for Map/Agent Ban-Pick
│           └── identity/     # User management, JWT authentication, and role-based access control
└── Frontend/
    ├── src/
    │   ├── components/       # Reusable UI components (Brackets, Dashboards, Pick-Ban grids)
    │   ├── hooks/            # Custom React hooks for API requests and WebSocket subscriptions
    │   ├── pages/            # Main application views (Home, Tournament Lobby, Admin Panel)
    │   └── services/         # Axios API configurations and STOMP WebSocket client setup
