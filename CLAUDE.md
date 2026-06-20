# VideoTube — Project Guide

## Project Overview

VideoTube is a YouTube-like full-stack application. This repo contains the **backend** (Node.js/Express/MongoDB). The **frontend does not exist yet and must be built** — see the Frontend section below.

**Author:** Navya Jain  
**DB Name:** `videotube`  
**Server:** `http://localhost:8000`  
**API Base:** `/api/v1`

---

## Backend Architecture

### Stack
- **Runtime:** Node.js (ESM — `"type": "module"`)
- **Framework:** Express 5
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (access token + refresh token in HttpOnly cookies)
- **File uploads:** Multer → Cloudinary
- **Dev server:** `npm run dev` (nodemon + dotenv)

### Folder Structure
```
src/
├── index.js                  # Entry point — connects DB, starts server
├── app.js                    # Express app setup (CORS, JSON, cookie-parser)
├── constants.js              # DB_NAME = "videotube"
├── db/index.js               # MongoDB connection
├── models/
│   ├── user.model.js
│   ├── video.model.js
│   ├── comments.model.js
│   ├── likes.model.js
│   ├── playlist.model.js
│   ├── subscription.model.js
│   └── tweets.model.js
├── controllers/
│   ├── user.controllers.js
│   ├── video.controllers.js
│   ├── comment.controllers.js
│   ├── like.conrollers.js        # note: typo in filename
│   ├── subscription.controllers.js
│   ├── PlayList.controllers.js
│   ├── tweet.controllers.js
│   └── dashboard.controllers.js
├── routes/
│   └── user.routes.js
├── middlewares/
│   ├── auth.middleware.js         # verifyJWT — attaches req.user
│   └── multer.js                  # disk storage for uploads
└── utils/
    ├── ApiError.js                # Custom error class
    ├── ApiResponse.js             # Standard JSON response wrapper
    ├── asyncHandler.js            # try/catch wrapper for controllers
    └── cloudinary.js              # Upload helper
```

### Environment Variables (`.env`)
```
PORT=8000
MONGODB_URI=
CORS_ORIGIN=http://localhost:5173
ACCESS_TOKEN_SECRET=
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Known Backend Issues to Fix Before/During Frontend Work
1. **`user.routes.js`** — references `protect` and `publishAVideo` that are not imported.
2. **`user.controllers.js` `loginUser`** — uses `new ApiError(...)` instead of `new ApiResponse(...)` for the success response.
3. **`user.model.js`** — `genrateAccessToken` and `genrateRefreshToken` are missing `return` before `jwt.sign(...)`.
4. **`subscription.model.js`** — imports `User` from user.model with a non-ESM-safe path (missing `.js`).
5. **`video.controllers.js`** — `import {Video, Video}` is a duplicate import.
6. **`dashboard.controllers.js`** and **`tweet.controllers.js`** — controllers are stubs (TODO).
7. **`comment.controllers.js`** — `getVideoComments` is a stub.
8. **`like.conrollers.js`** — `getLikedVideos` aggregate is missing a final `return res.json(...)`.
9. **Routes for videos, comments, likes, subscriptions, playlists, tweets, dashboard are not registered in `app.js`** — only `/api/v1/users` is registered.

---

## Data Models

### User
| Field | Type | Notes |
|---|---|---|
| username | String | unique, lowercase, indexed |
| email | String | unique, lowercase |
| fullName | String | indexed |
| avatar | String | Cloudinary URL, required |
| coverImage | String | Cloudinary URL, optional |
| watchHistory | [ObjectId] | ref: Video |
| password | String | bcrypt hashed |
| refreshToken | String | |

### Video
| Field | Type | Notes |
|---|---|---|
| videoFile | String | Cloudinary URL |
| thumbnail | String | Cloudinary URL |
| title | String | |
| description | String | |
| duration | Number | from Cloudinary |
| views | Number | default 0 |
| isPublished | Boolean | default true |
| owner | ObjectId | ref: User |

### Comment
| Field | Type |
|---|---|
| content | String |
| video | ObjectId → Video |
| owner | ObjectId → User |

### Like
| Field | Type | Notes |
|---|---|---|
| owner | ObjectId → User | |
| likedBy | ObjectId → User | |
| video | ObjectId → Video | optional |
| comment | ObjectId → Comment | optional |
| tweet | ObjectId → Tweet | optional |

### Subscription
| Field | Type | Notes |
|---|---|---|
| subscriber | ObjectId → User | the one who subscribes |
| channel | ObjectId → User | the one being subscribed to |

### Playlist
| Field | Type |
|---|---|
| name | String |
| description | String |
| owner | ObjectId → User |
| videos | [ObjectId → Video] |

### Tweet
| Field | Type |
|---|---|
| content | String |
| owner | ObjectId → User |
| video | ObjectId → Video (optional) |

---

## API Reference

### Auth / Users — `/api/v1/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register (multipart: avatar required, coverImage optional) |
| POST | `/login` | No | Login with email or username + password |
| POST | `/logout` | JWT | Logout (clears cookies) |
| POST | `/refresh-token` | No | Refresh access token via cookie or body |
| POST | `/change-password` | JWT | Change current password |
| GET | `/current-user` | JWT | Get logged-in user |
| PATCH | `/update-account` | JWT | Update fullName and email |
| PATCH | `/avatar` | JWT | Update avatar (multipart) |
| GET | `/c/:username` | JWT | Get channel profile with subscriber counts |
| GET | `/history` | JWT | Get watch history |

### Videos — `/api/v1/videos` *(routes not wired yet)*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | No | Get all videos (query: page, limit, query, sortBy, sortType, userId) |
| POST | `/` | JWT | Upload video (multipart: video + thumbnail) |
| GET | `/:videoId` | No | Get video by ID |
| PATCH | `/:videoId` | JWT | Update title, description, thumbnail |
| DELETE | `/:videoId` | JWT | Delete video |
| PATCH | `/toggle/publish/:videoId` | JWT | Toggle publish status |

### Comments — `/api/v1/comments` *(routes not wired yet)*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/:videoId` | No | Get comments for a video (paginated) |
| POST | `/:videoId` | JWT | Add comment to video |
| PATCH | `/:videoId/:commentId` | JWT | Update comment |
| DELETE | `/:commentId` | JWT | Delete comment |

### Likes — `/api/v1/likes` *(routes not wired yet)*

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/toggle/v/:videoId` | JWT | Toggle like on video |
| POST | `/toggle/c/:commentId` | JWT | Toggle like on comment |
| POST | `/toggle/t/:tweetId` | JWT | Toggle like on tweet |
| GET | `/videos` | JWT | Get all liked videos |

### Subscriptions — `/api/v1/subscriptions` *(routes not wired yet)*

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/c/:channelId` | JWT | Toggle subscribe/unsubscribe |
| GET | `/c/:channelId` | JWT | Get subscribers of a channel |
| GET | `/u/:subscriberId` | JWT | Get channels a user subscribed to |

### Playlists — `/api/v1/playlists` *(routes not wired yet)*

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT | Create playlist |
| GET | `/user/:userId` | JWT | Get all playlists by user |
| GET | `/:playlistId` | No | Get playlist by ID |
| POST | `/:playlistId/:videoId` | JWT | Add video to playlist |
| DELETE | `/:playlistId/:videoId` | JWT | Remove video from playlist |
| DELETE | `/:playlistId` | JWT | Delete playlist |

### Tweets — `/api/v1/tweets` *(stubs — not implemented)*

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/` | JWT | Create tweet |
| GET | `/user/:userId` | JWT | Get user tweets |
| PATCH | `/:tweetId` | JWT | Update tweet |
| DELETE | `/:tweetId` | JWT | Delete tweet |

### Dashboard — `/api/v1/dashboard` *(stubs — not implemented)*

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/stats` | JWT | Channel stats (views, subs, video count, likes) |
| GET | `/videos` | JWT | All videos uploaded by logged-in channel |

---

## Frontend — Must Be Built

### Recommended Stack
- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **State / Server state:** React Query (TanStack Query) for API calls + Zustand for auth state
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form
- **HTTP client:** Axios (with interceptors to attach access token and auto-refresh)

### Location
The frontend lives inside this repo at `client/`:
```
/Users/navyajain/Backend/
├── src/          ← backend
└── client/       ← frontend (React + Vite)
```

### Pages to Build

| Page | Route | Auth Required |
|---|---|---|
| Home / Feed | `/` | No |
| Login | `/login` | No |
| Register | `/register` | No |
| Video Player | `/watch/:videoId` | No |
| Channel Profile | `/channel/:username` | No |
| Upload Video | `/upload` | Yes |
| Edit Video | `/edit/:videoId` | Yes |
| Playlist Detail | `/playlist/:playlistId` | No |
| Liked Videos | `/liked` | Yes |
| Watch History | `/history` | Yes |
| Dashboard | `/dashboard` | Yes |
| Settings (account/avatar) | `/settings` | Yes |

### Key Frontend Features

1. **Auth flow** — Register with avatar upload (multipart), login stores tokens, axios interceptor refreshes token on 401 automatically.
2. **Video feed** — paginated grid on homepage, filterable by query/sort.
3. **Video player page** — plays video, shows title/description, like button, comments section, subscribe button, recommended videos.
4. **Comments** — list with pagination, add/edit/delete (owner only), like toggle per comment.
5. **Channel page** — avatar, cover image, subscriber count, subscribe toggle, videos tab.
6. **Upload flow** — multipart form with title, description, video file, thumbnail.
7. **Playlists** — create, view, add/remove videos, delete.
8. **Dashboard** — total views, subscribers, video count, video management table.

### Axios Setup Example
```js
// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  withCredentials: true,          // sends cookies
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await axios.post("/users/refresh-token", {}, { withCredentials: true });
      return api(error.config);   // retry original request
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Standard API Response Shape
```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "...",
  "success": true
}
```
Always read `response.data.data` for the payload.

---

## Development Workflow

### Start Backend
```bash
cd /Users/navyajain/Backend
npm run dev
```

### Start Frontend
```bash
cd /Users/navyajain/Backend/client
npm run dev    # runs on http://localhost:5173
```

The backend CORS is configured for `http://localhost:5173` via `CORS_ORIGIN` env var.
