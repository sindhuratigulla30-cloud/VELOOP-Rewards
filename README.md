# VELOOP Rewards

A full-stack rewards and giveaway platform where users can create accounts, view active and previous giveaways, participate using supported reward currencies, track their participation and transactions, and view winner announcements.

## Project Overview

VELOOP Rewards is developed using React for the frontend, Node.js and Express for the backend, and MongoDB for database storage.

### Live Application

- **Frontend:** https://veloop-rewards-frontend.vercel.app/
- **Backend API:** https://veloop-rewards-backend-three.vercel.app/
- **GitHub Repository:** https://github.com/sindhuratigulla30-cloud/VELOOP-Rewards

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React 19 |
| Frontend tooling | Vite |
| Routing | React Router |
| Backend | Node.js |
| API framework | Express 5 |
| Database | MongoDB Atlas |
| Database ODM | Mongoose |
| Authentication | JSON Web Tokens (JWT) |
| Password security | bcryptjs |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Deployment | Vercel |

## Implemented Features

### User Authentication
- User registration.
- User login.
- JWT-based authentication.
- Protected user-specific API endpoints.
- Password hashing using bcryptjs.

### Giveaway Management
- Retrieve the current giveaway.
- Retrieve previous giveaways.
- Retrieve giveaway details.
- View available prizes and entry information.
- Authenticated giveaway participation.
- Participation records stored in MongoDB.

### Wallet and Transaction History
- Participation uses configured entry fees and supported reward currencies.
- User transaction history endpoint.
- User participation history endpoint.

### Winner Management
- Admin-protected winner selection endpoint.
- Random winner selection using Node.js cryptographic random generation.
- Winner records stored in MongoDB.
- Public winner announcement endpoint for completed giveaways.
- Winner selection checks giveaway status and end date.

### Security
- JWT authentication middleware.
- Admin authorization for winner selection.
- Password hashing.
- CORS configuration.
- HTTP security headers using Helmet.
- Request rate limiting.
- JSON request-size limit.
- Database connection before API request processing.

## Project Structure

```text
VELOOP-Rewards/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── giveawayController.js
│   │   ├── userController.js
│   │   └── winnerController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Giveaway.js
│   │   ├── GiveawayPrize.js
│   │   ├── GiveawayWinner.js
│   │   ├── Participation.js
│   │   ├── Prize.js
│   │   ├── User.js
│   │   └── WalletTransaction.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── giveawayRoutes.js
│   │   ├── userRoutes.js
│   │   └── winnerRoutes.js
│   ├── app.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── src/
    ├── public/
    ├── index.html
    └── package.json
```

## Local Installation and Setup

### Prerequisites

- Node.js and npm.
- MongoDB Atlas account or a MongoDB instance.
- Git.

### 1. Clone the repository

```bash
git clone https://github.com/sindhuratigulla30-cloud/VELOOP-Rewards.git
cd VELOOP-Rewards
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CORS_ORIGINS=http://localhost:5173
```

Use your own MongoDB connection string and a strong secret. Never commit `.env` files or credentials to GitHub.

Start the backend:

```bash
npm run dev
```

The local backend runs at:

http://localhost:5000

### 3. Configure the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the frontend directory:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The local frontend runs at:

http://localhost:5173

### 4. Build the frontend

```bash
cd frontend
npm run build
```

## API Documentation

Base URL:

```text
https://veloop-rewards-backend-three.vercel.app
```

### Health Check

| Method | Endpoint | Access |
|---|---|---|
| GET | `/` | Public |

### Authentication APIs

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |

### User APIs

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/users/me` | Authenticated |
| GET | `/api/users/me/participations` | Authenticated |
| GET | `/api/users/me/transactions` | Authenticated |

### Giveaway APIs

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/giveaways/current` | Public |
| GET | `/api/giveaways/previous` | Public |
| GET | `/api/giveaways/:id` | Public |
| POST | `/api/giveaways/:giveawayId/join` | Authenticated |

### Winner APIs

| Method | Endpoint | Access |
|---|---|---|
| GET | `/api/winners/:giveawayId` | Public |
| POST | `/api/winners/:giveawayId/select` | Admin only |

For protected endpoints, provide the JWT token in the request header:

```text
Authorization: Bearer YOUR_JWT_TOKEN
```

The winner selection endpoint requires an authenticated administrator and an eligible ended giveaway.

## Deployment

The application is deployed using Vercel.

### Backend Environment Variables

Configure these in the backend Vercel project:

- `MONGO_URI`
- `JWT_SECRET`
- `CORS_ORIGINS` (when additional frontend origins are required)

### Frontend Environment Variables

Configure:

- `VITE_API_URL`

Set the production frontend API URL to the deployed backend URL.

Never expose database credentials or JWT secrets in frontend code or public repositories.

## Verification Performed

The following checks have been performed during development:

- Backend JavaScript syntax checks passed.
- Frontend production build completed successfully.
- Backend production health endpoint responded successfully.
- Current giveaway API returned giveaway data.
- Winner API route responded and invalid giveaway ID validation was checked.
- Public winner retrieval correctly rejected a giveaway that had not completed.
- Backend production deployment reached Ready status.

### Testing Limitations

The actual winner-selection operation has not yet been verified against a real ended giveaway with eligible participants.

A complete end-to-end test of all task requirements, including concurrent participation, every wallet edge case, claim processing, and fraud monitoring, should not be considered completed based only on the checks above.

## Future Improvements

- Complete end-to-end winner selection testing.
- Expand automated API and integration tests.
- Add comprehensive prize claim workflows.
- Expand fraud detection and audit logging.
- Add additional administrative giveaway management tools.
- Improve monitoring and error reporting.

## Author

VELOOP Rewards — Internship Project

Repository: https://github.com/sindhuratigulla30-cloud/VELOOP-Rewards

---

**Note:** This README describes the current documented project implementation. Features should only be marked fully complete after their corresponding tests have passed.
