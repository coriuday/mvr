# MVR Consultants — Frontend

Next.js 15 frontend for the MVR Consultants platform.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **State**: Zustand + TanStack Query
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios

## Getting Started

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your values
# Then start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Environment Variables

See [`.env.example`](.env.example) for the full list.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_APP_URL` | This app's URL |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | For image display |

## Folder Structure

```
src/
├── app/          # App Router pages
├── components/   # Reusable UI components
├── services/     # API service functions
├── hooks/        # Custom React hooks
├── lib/          # Utility functions
├── store/        # Zustand state stores
├── constants/    # Application constants
├── styles/       # Additional styles
└── types/        # TypeScript type definitions
```

## Design System

| Token | Value |
|-------|-------|
| Primary (Navy) | `#1a2f5e` |
| Accent (Gold) | `#c9a84c` |
| Font (Body) | Inter |
| Font (Heading) | Playfair Display |
