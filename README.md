# VideoTube

A YouTube-like full-stack application. Node.js/Express/MongoDB backend with a React/Vite frontend.

## Requirements

- Node.js 18+
- MongoDB (Atlas or local)
- Cloudinary account

## Setup

### 1. Clone and install

```bash
npm install          # backend deps
npm run install:client  # frontend deps
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in every value:

```bash
cp .env.example .env
```

**Required backend variables** (`.env` in repo root):

| Variable | Description |
|---|---|
| `PORT` | Server port (default 8000) |
| `MONGODB_URI` | Full MongoDB connection string |
| `CORS_ORIGIN` | Frontend origin (comma-separated for multiple, e.g. `http://localhost:5173`) |
| `ACCESS_TOKEN_SECRET` | JWT secret — use `openssl rand -base64 64` |
| `ACCESS_TOKEN_EXPIRY` | e.g. `1d` |
| `REFRESH_TOKEN_SECRET` | JWT secret — use `openssl rand -base64 64` |
| `REFRESH_TOKEN_EXPIRY` | e.g. `10d` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_SECRET_NAME` | Cloudinary API secret |
| `NODE_ENV` | Set to `production` when deploying |

**Required frontend variables** (`client/.env`, based on `client/.env.example`):

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL, e.g. `https://api.yourdomain.com/api/v1` |

### 3. Run locally

```bash
# Backend only
npm run dev

# Frontend only (in another terminal)
npm run dev:client

# Both together
npm run dev:all
```

- Backend: `http://localhost:8000`
- Frontend: `http://localhost:5173`

### 4. Build frontend for production

```bash
npm run build:client
```

The built output is in `client/dist/`.

## API

Base path: `/api/v1`

| Resource | Prefix |
|---|---|
| Users / Auth | `/api/v1/users` |
| Videos | `/api/v1/videos` |
| Comments | `/api/v1/comments` |
| Likes | `/api/v1/likes` |
| Subscriptions | `/api/v1/subscriptions` |
| Playlists | `/api/v1/playlists` |
| Dashboard | `/api/v1/dashboard` |
| Tweets | `/api/v1/tweets` |

Health check: `GET /health`

## Key notes before deploying

- Replace `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` with strong random values
- Set `NODE_ENV=production` (enables secure cookies over HTTPS)
- Set `CORS_ORIGIN` to your actual frontend domain, not `*`
- Set `VITE_API_URL` in `client/.env` to your production backend URL, then rebuild the frontend
