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

* **Framework:** ASP.NET Core Web API
* **Language:** C#
* **Database:** Microsoft SQL Server
* **ORM:** Entity Framework Core


### Frontend

* **Framework:** React 19
* **Build Tool:** Vite
* **HTTP Client:** Axios
* **Styling:** Tailwind CSS

## Project Structure

```text
├── Backend/
│   ├── API/                  # Controllers handling HTTP requests and SignalR Hubs
│   ├── Core/                 # Domain Entities, Interfaces, and Shared DTOs
│   ├── Infrastructure/       # Database Context, EF Core Migrations, and Repositories
│   └── Modules/
│       ├── Tournament/       # Business logic for tournament and bracket management
│       ├── Drafting/         # Core logic for Map and Agent Ban/Pick workflows
│       └── Identity/         # User authentication and role-based authorization
└── Frontend/
    ├── src/
    │   ├── components/       # Reusable UI components (Brackets, Dashboards)
    │   ├── hooks/            # Custom React hooks for API and real-time data
    │   ├── pages/            # Application views (Home, Lobby, Admin Panel)
    │   └── services/         # Axios API configurations and SignalR client setup
