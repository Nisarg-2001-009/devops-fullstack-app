# Personal Finance Tracker — Full Stack Web Application

> **Project 4 of 4** in my DevOps & Software Engineering Portfolio  
> A production-grade full-stack application demonstrating React 18, FastAPI, PostgreSQL, JWT authentication, Recharts data visualisation, and Docker Compose orchestration.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql) ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker) ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss)

---

## What This Project Demonstrates

This project was built to demonstrate the skills expected of a junior-to-mid level software engineer or DevOps engineer:

- **Frontend engineering** — React 18 with hooks, context API for global state, protected routing, and responsive UI with Tailwind CSS
- **API integration** — Axios with request interceptors that automatically attach JWT tokens to every outgoing request, and response interceptors that handle 401 errors globally
- **Authentication** — Full JWT login/register flow: token issued by FastAPI, stored in localStorage, attached to requests, cleared on logout or expiry
- **Data visualisation** — Recharts line charts and bar charts rendering live analytics data from the backend
- **Containerisation** — Multi-stage Docker build (Node.js build stage → Nginx production serve stage), Docker Compose orchestrating three services on a shared network
- **Database migrations** — Alembic runs automatically on backend container startup, so the database schema is always in sync with the application code
- **Production patterns** — Nginx proxying API calls internally by container name, environment variables via .env files, health checks on the database service

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI library — functional components and hooks throughout |
| Vite | 5 | Build tool and dev server — near-instant HMR, Rollup bundling for production |
| React Router | v6 | Client-side routing with protected route pattern using Outlet |
| Axios | 1.x | HTTP client with request/response interceptors for JWT handling |
| Recharts | 2.x | Composable charting library built on D3 and React SVG |
| Tailwind CSS | v3 | Utility-first CSS — all styling co-located with markup, purged at build time |

### Backend (Project 3 — [devops-python-api](https://github.com/Nisarg-2001-009/devops-python-api))
| Technology | Purpose |
|---|---|
| FastAPI | High-performance async Python web framework with automatic OpenAPI docs |
| Uvicorn | ASGI server running the FastAPI application |
| PostgreSQL 15 | Relational database for users, accounts, transactions, budgets, categories |
| SQLAlchemy | ORM — Python models mapped to database tables |
| Alembic | Database migration tool — version-controlled schema changes |
| python-jose | JWT token creation and validation |
| Pydantic | Request/response data validation and serialisation |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker | Containerises both frontend and backend as isolated, reproducible images |
| Docker Compose | Orchestrates frontend + backend + database as a single stack |
| Nginx | Serves the built React static files and proxies /api/* to the backend container |
| Multi-stage build | Node.js builds the React app, Nginx serves the compiled output — final image has no Node.js in it |

---

## Application Features

### Authentication
- User registration with email and password (Pydantic validation, bcrypt hashing)
- JWT login — access token stored in localStorage, survives page refresh
- Automatic token attachment via Axios request interceptor — no manual header setting in any component
- Global 401 handler — if any request returns 401, localStorage is cleared and user is redirected to /login
- Protected routes — PrivateRoute component wraps all authenticated pages, unauthenticated users are redirected automatically

### Accounts
- Create bank accounts with name, type (checking, savings, credit, investment), and opening balance
- View all accounts as cards showing balance with GBP formatting
- Account data linked to the authenticated user via JWT — users only see their own accounts

### Transactions
- Add income and expense transactions linked to a specific account
- Table view of all transactions with date, description, category, type badge, and amount
- Colour-coded amounts — green for income, red for expenses
- Delete transactions with confirmation

### Analytics Dashboard
- **Summary cards** — Total Income, Total Expenses, Net Balance calculated in real time from transaction data
- **Monthly Trends chart** — Recharts LineChart showing spending over time by month
- **Budget vs Actual chart** — Recharts BarChart comparing budgeted vs actual spend per category

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                         │
│  ┌──────────────────┐      ┌───────────────────────┐   │
│  │  finance_frontend │      │   finance_backend      │   │
│  │                  │      │                       │   │
│  │  Nginx :80       │─────▶│  FastAPI + Uvicorn    │   │
│  │  Serves React SPA│      │  :8000                │   │
│  │  Proxies /api/*  │      │                       │   │
│  └──────────────────┘      └───────────┬───────────┘   │
│                                        │               │
│                             ┌──────────▼──────────┐   │
│                             │   finance_db         │   │
│                             │   PostgreSQL :5432   │   │
│                             │   (health checked)   │   │
│                             └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                ▲
                │ HTTP :80
         User's Browser
```

**Key architectural decisions:**
- The browser only talks to port 80 (Nginx). It never directly reaches the backend or database
- Nginx proxies requests matching `/api/*` to `http://backend:8000` using Docker's internal DNS — no hardcoded IP addresses
- The database is not exposed on any host port — only reachable inside the Docker network
- The backend waits for the database to be healthy (via `depends_on` with `condition: service_healthy`) before starting
- Alembic migrations run inside the backend container on every startup via a shell entrypoint script, ensuring schema is always up to date

---

## Project Structure

```
devops-fullstack-app/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js           # Axios instance, interceptors, all API functions
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global auth state: user, token, login(), logout()
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Navigation bar with logout
│   │   │   └── PrivateRoute.jsx   # Redirects unauthenticated users to /login
│   │   └── pages/
│   │       ├── Login.jsx          # JWT login form
│   │       ├── Register.jsx       # User registration form
│   │       ├── Dashboard.jsx      # Analytics cards + Recharts charts
│   │       ├── Accounts.jsx       # Account list and creation form
│   │       └── Transactions.jsx   # Transaction table with add/delete
│   ├── Dockerfile                 # Multi-stage: node:20-alpine build → nginx:alpine serve
│   ├── nginx.conf                 # SPA fallback routing + /api proxy
│   ├── vite.config.js             # Vite config with dev proxy to backend
│   └── tailwind.config.js         # Content paths for Tailwind purging
├── backend/                       # Cloned from devops-python-api (Project 3)
│   ├── app/                       # FastAPI application code
│   ├── alembic/                   # Database migration files
│   ├── Dockerfile                 # Python backend container
│   └── start.sh                   # Runs migrations then starts uvicorn
├── docker-compose.yml             # Orchestrates all three services
├── .env.example                   # Template for required environment variables
└── README.md                      # This file
```

---

## Quick Start

### Prerequisites
- Docker Desktop (includes Docker Compose)
- Git

### Run Locally

```bash
# Clone the frontend repo
git clone https://github.com/Nisarg-2001-009/devops-fullstack-app.git
cd devops-fullstack-app

# Clone the backend into the expected location
git clone https://github.com/Nisarg-2001-009/devops-python-api.git backend

# Set up environment variables
cp .env.example .env

# Build and start all three containers
docker compose up --build
```

The stack will:
1. Start PostgreSQL and wait until it passes the health check
2. Start the FastAPI backend — Alembic runs migrations automatically
3. Build the React app with Node.js and serve it via Nginx

**Access the application:**
| URL | Description |
|---|---|
| http://localhost | React frontend |
| http://localhost:8000/docs | FastAPI Swagger UI — interactive API documentation |
| http://localhost:8000/redoc | ReDoc API documentation |

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_DB` | financedb | Database name |
| `POSTGRES_USER` | financeuser | Database user |
| `POSTGRES_PASSWORD` | financepass | Database password — change in production |
| `SECRET_KEY` | changeme | JWT signing secret — must be changed in production |

---

## Authentication Flow — Step by Step

```
User submits register form
│
▼
POST /api/v1/auth/register  →  FastAPI validates email + password
│                              bcrypt hashes password, saves user
▼
User submits login form
│
▼
POST /api/v1/auth/login  →  FastAPI verifies password hash
│                           Returns { access_token: "eyJ..." }
▼
AuthContext stores token in localStorage + React state
│
▼
Axios request interceptor reads token on every outgoing request
Adds header: Authorization: Bearer eyJ...
│
▼
FastAPI validates token on every protected endpoint
Returns user-specific data
│
▼
On logout: localStorage cleared, state reset, redirect to /login
On 401:    Same as logout — handles token expiry automatically
```

---

## Docker Build Process

### Frontend — Multi-Stage Build

```dockerfile
# Stage 1: Build with Node.js
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci                    # Clean install from lockfile — reproducible builds
COPY . .
RUN npm run build             # Vite compiles and bundles to /app/dist

# Stage 2: Serve with Nginx
FROM nginx:alpine             # Fresh image — no Node.js, no source code
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

**Why multi-stage?** The final production image only contains Nginx and the compiled static files — no Node.js runtime, no source code, no node_modules. This keeps the image small and secure.

### Backend — Automatic Migrations

```bash
# start.sh — runs inside the container on every startup
alembic upgrade head    # Apply any pending migrations
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

This means you never need to manually run migrations after deploying or restarting the stack.

---

## API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Create new user account | No |
| POST | `/api/v1/auth/login` | Login, returns JWT token | No |
| GET | `/api/v1/accounts` | List all user accounts | JWT |
| POST | `/api/v1/accounts` | Create a new account | JWT |
| GET | `/api/v1/transactions` | List transactions (paginated) | JWT |
| POST | `/api/v1/transactions` | Create a transaction | JWT |
| DELETE | `/api/v1/transactions/{id}` | Delete a transaction | JWT |
| GET | `/api/v1/analytics/summary` | Monthly spending by category | JWT |
| GET | `/api/v1/analytics/trends` | Monthly spending trends | JWT |
| GET | `/api/v1/analytics/budget-vs-actual` | Budget comparison | JWT |

Full interactive documentation available at http://localhost:8000/docs when running locally.

---

## Portfolio Context

This is the fourth and final project in a progressive DevOps and software engineering portfolio:

| Project | Focus | Repository |
|---|---|---|
| Project 1 | Linux, Bash scripting, system automation | devops-bash-scripts |
| Project 2 | Docker, containerisation, microservices | devops-docker-projects |
| Project 3 | FastAPI REST API, PostgreSQL, JWT, Alembic | [devops-python-api](https://github.com/Nisarg-2001-009/devops-python-api) |
| **Project 4** | **React frontend, full-stack integration, Docker Compose** | **devops-fullstack-app (this repo)** |

Each project builds on the previous — Project 4 consumes the API built in Project 3 and adds a complete production frontend, tying everything together into a deployable full-stack application.

---

## Author

**Nisarg Patel**  
[GitHub](https://github.com/Nisarg-2001-009)
