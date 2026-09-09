# Backend — Smart Disaster Management System

Node.js + Express + MongoDB (Mongoose) API. Built incrementally alongside
the existing React frontend, per the project plan. **Only Phase 2 (backend
scaffold) and Phase 4 (authentication) are implemented so far** — everything
else (incidents, rescue, hospitals, shelters, etc.) is still mock data on
the frontend and has not been built yet.

## What actually works right now

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (requires `Authorization: Bearer <token>`)
- `GET /api/health`

Everything else described in the full project plan (incidents, rescue
missions, hospitals, shelters, volunteers, admin analytics, weather, AI risk
prediction, alerts, notifications) is **not implemented yet** — do not
demo those as working.

## Setup

1. Install MongoDB locally, or use a free MongoDB Atlas cluster.
2. Copy the env file and fill in real values:
   ```bash
   cd backend
   cp .env.example .env
   ```
   At minimum set `MONGO_URI` and a random `JWT_SECRET`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run in dev mode (auto-restarts on change):
   ```bash
   npm run dev
   ```
   You should see:
   ```
   MongoDB connected: <host>/<db>
   Server listening on http://localhost:5000
   ```

## Manually testing the auth flow

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test Citizen","email":"test@example.com","password":"password123","role":"citizen","location":"Chennai"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","password":"password123"}'

# Copy the "token" from the login response, then:
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

If register → login → `/me` all succeed with real data (no errors, no
mock/placeholder text), authentication is genuinely working end-to-end.
This has **not been run in the sandbox that generated this code** (no
network/MongoDB access there) — please run it yourself and report back
any errors so they can be fixed before we move to Phase 6 (incidents).

## Project structure

```text
backend/
├── src/
│   ├── config/db.js          # Mongo connection
│   ├── controllers/          # authController.js (register/login/me)
│   ├── middleware/           # auth.js (JWT + role guard), errorHandler.js
│   ├── models/                # User.js
│   ├── routes/                # auth.js
│   ├── utils/                  # ApiError, asyncHandler
│   ├── uploads/                # multer target (empty for now)
│   ├── app.js                   # Express app, all routes mount here
│   └── server.js                # entry point
├── .env.example
├── .gitignore
└── package.json
```

## Next steps (in priority order, per the project plan)

1. Frontend: central Axios client (`src/api/axiosClient.js`) with JWT
   interceptor, plus an `AuthContext` and `ProtectedRoute` so login actually
   persists and dashboards are guarded by role.
2. Rewrite `frontend/src/services/authService.js` to call these real
   endpoints (same function signatures, so calling pages don't change).
3. Phase 6: `Incident` model + `/api/incidents` routes, then wire up
   `ReportEmergencyPage` and `MyReportsPage`.
