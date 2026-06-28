# MVR Consultants — Backend (Rust + Axum)

Rust REST API backend for the MVR Consultants platform.

## Tech Stack

- **Language**: Rust 1.95+
- **Framework**: Axum 0.7
- **Runtime**: Tokio
- **Database**: SQLx → Supabase PostgreSQL
- **Auth**: JWT (jsonwebtoken) + Argon2 password hashing
- **Email**: Resend API

## Getting Started

```bash
# Install Rust (if not already)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Copy environment variables
cp .env.example .env

# Edit .env with your Supabase URL, JWT secrets, etc.

# Run database migrations (requires DATABASE_URL set)
cargo install sqlx-cli
sqlx migrate run

# Start development server
cargo run
```

Server starts at [http://localhost:8080](http://localhost:8080).

## API Architecture

```
Route → Handler → Service → Repository → Database
```

## Key Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | Public | Health check |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh` | Token | Refresh token |
| POST | `/api/leads` | Public | Submit inquiry |
| GET | `/api/leads` | Admin | Get all leads |
| GET | `/api/blogs` | Public | Get blog posts |
| GET | `/api/universities` | Public | Get universities |
| GET | `/api/admin/stats` | Admin | Dashboard stats |

## Environment Variables

See [`.env.example`](.env.example) for the full list.

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Supabase PostgreSQL URL |
| `JWT_SECRET` | ✅ | JWT signing secret |
| `JWT_REFRESH_SECRET` | ✅ | Refresh token secret |
| `RESEND_API_KEY` | ⚠️ | Email sending |
| `CLOUDINARY_*` | ⚠️ | Image uploads |

## Database Migrations

```bash
# Run all pending migrations
sqlx migrate run

# Revert last migration
sqlx migrate revert

# Check migration status
sqlx migrate info
```

## Security Features

- ✅ Argon2id password hashing
- ✅ JWT with separate access/refresh secrets
- ✅ Role-based access control (ADMIN, EDITOR, COUNSELOR)
- ✅ CORS configured per environment
- ✅ Rate limiting (Nginx layer)
- ✅ Input validation on all endpoints
- ✅ Non-root Docker user

## Production deploy (Render)

CI on `master` triggers a Render deploy hook after backend and frontend checks pass. The frontend deploys separately via Vercel.

If the **Deploy Backend → Render** job fails with **HTTP 401**, the deploy hook URL in GitHub is invalid or expired (app code is fine). Rotate the secret:

1. **Render:** Dashboard → **mvr-backend** → **Settings** → **Deploy Hook** → copy URL or **Regenerate**
2. **GitHub:** Repository → **Settings** → **Environments** → **production** → **Environment secrets**
   - Set `RENDER_DEPLOY_HOOK_URL` to the full hook URL (no quotes, no trailing spaces)
   - This job uses the **production environment** secret, not repository-level secrets alone
3. Re-run the failed workflow or push to `master` and confirm the deploy step prints **HTTP 200**

Until the hook works, deploy manually from the Render dashboard. CI is configured so a bad hook warns on the deploy job but does not fail the whole pipeline after build checks pass.
