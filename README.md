<div align="center">

# MVR Consultants

### *Dream. Plan. Achieve.*

**A production-grade consultancy platform for Study Abroad, Visa Guidance, Scholarships & University Admissions**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Rust](https://img.shields.io/badge/Rust-2024_Edition-CE422B?style=for-the-badge&logo=rust)](https://www.rust-lang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

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
| 💬 Testimonials | Client testimonial management |
| 📊 Admin Dashboard | Analytics, lead management, blog & university management |

---

## 🏗️ Architecture

```
Client Browser
      ↓
┌─────────────────────────────┐
│  Frontend (Vercel)          │
│  Next.js 16 + React 19      │
└─────────────┬───────────────┘
              │ HTTPS API calls
              ↓
┌─────────────────────────────┐
│  Backend (Render)           │
│  Rust + Axum  Port: 8080    │
└─────────────┬───────────────┘
              ↓
      Supabase (PostgreSQL)
```

> For local development, an optional Nginx reverse proxy is available via Docker Compose.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2.6 | React framework with App Router |
| React | 19.2.4 | UI library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Base UI | 1.x | Headless UI primitives |
| shadcn | 4.x | Component scaffolding CLI |
| Framer Motion | 12.x | Animations & transitions |
| Zustand | 5.x | Client state management |
| TanStack Query | 5.x | Server state & data fetching |
| React Hook Form | 7.x | Form management |
| Zod | 4.x | Schema validation |
| Axios | 1.x | HTTP client |
| Sonner | 2.x | Toast notifications |
| Lucide React | 1.x | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Rust | 2024 Edition | Systems language |
| Axum | 0.7 | Web framework |
| Tokio | 1.x | Async runtime |
| Tower HTTP | 0.5 | Middleware (CORS, tracing, compression) |
| SQLx | 0.7 | Async PostgreSQL driver |
| Serde | 1.x | JSON serialization |
| jsonwebtoken | 9.x | JWT auth |
| Argon2 | 0.5 | Password hashing |
| Tracing | 0.1 | Structured logging |
| reqwest | 0.12 | HTTP client (Cloudinary, Resend) |
| resend-rs | 0.25 | Transactional email |
| validator | 0.18 | Request validation |

### Infrastructure
| Technology | Purpose |
|-----------|---------|
| Supabase | Hosted PostgreSQL (shared team DB) |
| Vercel | Frontend hosting & edge deployment |
| Render | Backend Docker-based hosting (Singapore region) |
| Cloudinary | Image uploads & CDN delivery |
| Resend | Transactional email |
| Docker + Compose | Local development orchestration |
| Nginx | Local reverse proxy |

---

## 📁 Folder Structure

```
mvr/
├── frontend/                  # Next.js 16 application
│   ├── public/                # Static assets, favicons, logo
│   └── src/
│       ├── app/
│       │   ├── (public)/      # Public-facing pages
│       │   │   ├── page.tsx   # Homepage
│       │   │   ├── about/
│       │   │   ├── blogs/
│       │   │   ├── contact/
│       │   │   ├── countries/
│       │   │   ├── faq/
│       │   │   ├── privacy/
│       │   │   ├── scholarships/
│       │   │   ├── services/
│       │   │   ├── terms/
│       │   │   ├── universities/
│       │   │   └── visa/
│       │   ├── admin/         # Admin panel
│       │   │   ├── page.tsx   # Admin dashboard
│       │   │   ├── blogs/
│       │   │   ├── leads/
│       │   │   ├── login/
│       │   │   ├── unis/
│       │   │   └── users/
│       │   └── dashboard/     # User dashboard
│       ├── components/        # UI components
│       ├── services/          # API service layer
│       ├── hooks/             # Custom React hooks
│       ├── lib/               # Utilities
│       ├── store/             # Zustand stores
│       ├── constants/         # App constants
│       ├── data/              # Static data
│       ├── styles/            # Global styles
│       └── types/             # TypeScript types
│
├── backend/                   # Rust + Axum API server
│   ├── src/
│   │   ├── config/            # Environment config
│   │   ├── routes/            # Route definitions + AppState
│   │   ├── handlers/          # Request handlers
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   ├── models/            # Data models
│   │   ├── middleware/        # Auth, CORS middleware
│   │   ├── db/                # Database connection pool
│   │   └── utils/             # JWT, errors, response helpers
│   └── migrations/            # SQLx SQL migrations
│
├── supabase/                  # Supabase config & migrations
│   ├── migrations/
│   └── seed/
│
├── nginx/                     # Nginx reverse proxy config (local dev)
├── docker-compose.yml         # Full stack local orchestration
├── render.yaml                # Render deployment blueprint (backend)
├── .env.example               # Environment variable template
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | [nodejs.org](https://nodejs.org) |
| Rust | 1.85+ | [rustup.rs](https://rustup.rs) |
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

### 3. Start with Docker Compose (local dev)
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
| `JWT_EXPIRY_HOURS` | Access token expiry in hours (default: 24) |
| `JWT_REFRESH_EXPIRY_DAYS` | Refresh token expiry in days (default: 30) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary unsigned upload preset |
| `RESEND_API_KEY` | Resend email API key |
| `EMAIL_FROM` | Sender email address |
| `ADMIN_EMAIL` | Primary admin notification email |
| `FRONTEND_URL` | Frontend URL for CORS (e.g. http://localhost:3000) |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |
| `RUST_LOG` | Log level (e.g. `info`, `debug`) |

---

## 🗺️ API Reference

### Public Routes (no auth required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/auth/login` | POST | Login & receive JWT |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/blogs` | GET | List all published blogs |
| `/api/blogs/{slug}` | GET | Get blog by slug |
| `/api/universities` | GET | List all universities |
| `/api/scholarships` | GET | List all scholarships |
| `/api/testimonials` | GET | List all testimonials |
| `/api/contact` | POST | Submit contact form |
| `/api/leads` | POST | Submit inquiry / lead form |

### Protected Routes (valid JWT required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/logout` | POST | Logout (invalidate token) |
| `/api/auth/me` | GET | Get current user profile |

### Admin Routes (ADMIN role required)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create a new user account |
| `/api/admin/stats` | GET | Dashboard analytics |
| `/api/admin/recent-leads` | GET | Recent lead activity |
| `/api/leads` | GET | List all leads |
| `/api/leads/{id}` | GET / PUT / DELETE | Manage individual lead |
| `/api/blogs` | POST | Create blog post |
| `/api/blogs/{id}` | PUT / DELETE | Edit or delete blog |
| `/api/universities` | POST | Add university |
| `/api/universities/{id}` | PUT / DELETE | Edit or delete university |
| `/api/scholarships` | POST | Add scholarship |
| `/api/scholarships/{id}` | PUT | Edit scholarship |
| `/api/testimonials` | POST | Add testimonial |
| `/api/testimonials/{id}` | PUT | Edit testimonial |

---

## 🚢 Deployment

### Backend → Render
The backend deploys automatically via [`render.yaml`](render.yaml) as a Docker-based web service in the **Singapore** region.

```bash
# Render picks up render.yaml from the repo root automatically.
# Set secret env vars in: Render Dashboard → Environment
```

### Frontend → Vercel
The frontend deploys to Vercel. Set environment variables in the Vercel dashboard.

```bash
# Production build (Vercel runs this automatically)
cd frontend
npm run build
```

---

## 📈 Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| **Phase 1** | Project scaffolding, folder structure, base configuration | ✅ Done |
| **Phase 2** | Auth system, core APIs, homepage UI, admin dashboard | 🟡 In Progress |
| **Phase 3** | Blogs, testimonials, lead management, file uploads | ⏳ Pending |
| **Phase 4** | SEO optimization, analytics, deployment polish | ⏳ Pending |
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
  <em>Built with ❤️ by Team Glory X</em>
</div>
