<div align="center">

# MVR Consultants

### *Dream. Plan. Achieve.*

**A production-grade consultancy platform for Study Abroad, Visa Guidance, Scholarships & University Admissions**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Rust](https://img.shields.io/badge/Rust-1.95-CE422B?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## 📋 Project Overview

MVR Consultants is a **premium, SEO-first consultancy website** serving students seeking study abroad opportunities, visa guidance, scholarships, and university admissions support.

| Feature | Description |
|---------|-------------|
| 🌍 Study Abroad | Destination guides for USA, UK, Canada, Australia, Germany, Ireland & more |
| 🎓 University Admissions | Curated university listings with rankings and descriptions |
| 💰 Scholarships | Merit-based, need-based, and government scholarship listings |
| 📋 Visa Guidance | Country-specific visa process guides |
| 👤 Lead Management | Full CRM with status tracking and counselor assignment |
| 📝 Blog / CMS | Admin-managed articles with SEO metadata |
| 📊 Admin Dashboard | Analytics, lead management, user management |

---

## 🏗️ Architecture

```
Client Browser
      ↓
Nginx (Reverse Proxy)
      ↓
┌─────────────┬──────────────────┐
│  Frontend   │  Backend API     │
│  Next.js 15 │  Rust + Axum     │
│  Port: 3000 │  Port: 8080      │
└─────────────┴──────────────────┘
              ↓
      Supabase (PostgreSQL)
              ↓
     Redis (Caching — optional)
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.x | React framework with App Router |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| shadcn/ui | latest | Premium UI component library |
| Framer Motion | latest | Animations & transitions |
| Zustand | latest | Client state management |
| TanStack Query | 5.x | Server state & data fetching |
| React Hook Form | latest | Form management |
| Zod | latest | Schema validation |
| Axios | latest | HTTP client |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Rust | 1.95+ | Systems language |
| Axum | 0.7 | Web framework |
| Tokio | 1.x | Async runtime |
| Tower HTTP | 0.5 | Middleware (CORS, tracing) |
| SQLx | 0.7 | Async PostgreSQL driver |
| Serde | 1.x | JSON serialization |
| jsonwebtoken | 9.x | JWT auth |
| Argon2 | 0.5 | Password hashing |
| Tracing | 0.1 | Structured logging |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Supabase | Hosted PostgreSQL (shared team DB) |
| Cloudinary | Image uploads & CDN delivery |
| Resend | Transactional email |
| Docker + Compose | Containerization |
| Nginx | Reverse proxy |
| Redis | Caching (phase 5) |

---

## 📁 Folder Structure

```
mvr/
├── frontend/          # Next.js 15 application
│   ├── public/        # Static assets, favicons, logo
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/ # UI components
│       ├── services/  # API service layer
│       ├── hooks/     # Custom React hooks
│       ├── lib/       # Utilities
│       ├── store/     # Zustand stores
│       ├── constants/ # App constants
│       └── types/     # TypeScript types
│
├── backend/           # Rust + Axum API server
│   ├── src/
│   │   ├── config/    # Environment config
│   │   ├── routes/    # Route definitions
│   │   ├── handlers/  # Request handlers
│   │   ├── services/  # Business logic
│   │   ├── repositories/ # Data access layer
│   │   ├── models/    # Data models
│   │   ├── middleware/ # Auth, logging, CORS
│   │   ├── db/        # Database connection
│   │   └── utils/     # JWT, errors, validators
│   └── migrations/    # SQLx SQL migrations
│
├── supabase/          # Supabase config & migrations
│   ├── migrations/    # SQL migration files
│   └── seed/          # Seed data scripts
│
├── nginx/             # Nginx reverse proxy config
├── docker-compose.yml # Full stack orchestration
├── .env.example       # Environment variable template
└── README.md          # This file
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Rust | 1.95+ | [rustup.rs](https://rustup.rs) |
| Docker Desktop | latest | [docker.com](https://www.docker.com) |
| Git | latest | [git-scm.com](https://git-scm.com) |

### 1. Clone the repository
```bash
git clone https://github.com/your-org/mvr.git
cd mvr
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your Supabase URL, JWT secret, Cloudinary keys, etc.
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

### 3. Start with Docker Compose
```bash
docker compose up --build
```

This starts:
- **Frontend** → http://localhost:3000
- **Backend API** → http://localhost:8080
- **Nginx** → http://localhost:80

### 4. Or run services individually

**Frontend (development)**
```bash
cd frontend
npm install
npm run dev
```

**Backend (development)**
```bash
cd backend
cargo run
```

---

## 🔑 Environment Variables

See [`.env.example`](.env.example) for the complete list.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing (min 32 chars) |
| `JWT_REFRESH_SECRET` | Separate secret for refresh tokens |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `RESEND_API_KEY` | Resend email API key |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. http://localhost:3000) |
| `BACKEND_URL` | Backend API URL (e.g. http://localhost:8080) |
| `REDIS_URL` | Redis URL (optional) |

---

## 🗺️ API Reference

| Group | Endpoint | Method | Auth |
|-------|----------|--------|------|
| Auth | `/api/auth/register` | POST | Public |
| Auth | `/api/auth/login` | POST | Public |
| Auth | `/api/auth/refresh` | POST | Token |
| Auth | `/api/auth/logout` | POST | Token |
| Leads | `/api/leads` | GET, POST | Admin |
| Leads | `/api/leads/:id` | GET, PUT, DELETE | Admin |
| Blogs | `/api/blogs` | GET | Public |
| Blogs | `/api/blogs/:slug` | GET | Public |
| Blogs | `/api/blogs` | POST | Admin |
| Blogs | `/api/blogs/:id` | PUT, DELETE | Admin |
| Universities | `/api/universities` | GET | Public |
| Universities | `/api/universities` | POST | Admin |
| Scholarships | `/api/scholarships` | GET | Public |
| Contact | `/api/contact` | POST | Public |
| Admin | `/api/admin/stats` | GET | Admin |

---

## 🚢 Deployment

Deployment is configured for **DigitalOcean VPS** with Docker Compose + Nginx + SSL (Let's Encrypt).

See detailed deployment guide in [`docs/deployment.md`](docs/deployment.md) *(coming in Phase 4)*.

---

## 📈 Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Project scaffolding, folder structure, base configuration | 🟡 In Progress |
| **Phase 2** | Auth system, core APIs, homepage UI | ⏳ Pending |
| **Phase 3** | Blogs, testimonials, lead management, file uploads | ⏳ Pending |
| **Phase 4** | SEO optimization, analytics, deployment | ⏳ Pending |
| **Phase 5** | Monitoring, Redis caching, performance tuning | ⏳ Pending |

---

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow conventional commits (`feat:`, `fix:`, `chore:`)
3. Ensure `cargo clippy` and `npm run lint` pass
4. Submit a pull request with a clear description

---

## 📄 License

Copyright © 2025 MVR Consultants. All rights reserved.

---

<div align="center">
  <em>Built with ❤️ by the MVR Engineering Team</em>
</div>
