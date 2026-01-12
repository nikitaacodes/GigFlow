# GigFlow

GigFlow is a full-stack freelance marketplace platform where users can seamlessly switch roles between Client and Freelancer. Clients can post gigs, freelancers can bid on them, and a secure hiring flow ensures only one freelancer gets hired per gig — atomically and safely.

## Project Structure

```
GigFlow/
├── backend/               # Express.js API server
│   ├── config/            # DB & environment configuration
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth, error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # REST API routes
│   └── server.js          # Entry point
│
└── frontend/              # React (Vite) application
    ├── src/
    │   ├── components/    # Reusable UI components
    │   ├── pages/         # Page-level components
    │   ├── store/         # Redux Toolkit store & slices
    │   │   ├── slices/     # Redux slices (auth, gigs, bids)
    │   │   └── store.js    # Store configuration
    │   ├── utils/          # API helpers
    │   └── App.jsx        # Root component
    └── vite.config.js
```

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, React Router, Redux Toolkit
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with HttpOnly Cookies
- **Password Hashing**: bcryptjs
- **State Management**: Redux Toolkit

## Features

### Authentication

- User registration and login
- HttpOnly cookie-based authentication (secure, XSS-resistant)
- Protected routes
- Session management

### Gig Management (CRUD)

- **Create**: Post new gigs with title, description, budget, category, and deadline
- **Read**: Browse all open gigs with search and filter capabilities
- **Update**: Edit your own gigs (when open and no accepted bid)
- **Delete**: Delete your own gigs (when open)
- Public/private feed for browsing gigs

### Bidding System

- Freelancers can submit bids with proposal, bid amount, and estimated days
- View all bids on your posted gigs (owner only)
- Edit or delete pending bids
- Prevent duplicate bids

### Hiring Logic

- **Atomic Update**: When a client hires a freelancer:
  - Chosen bid status: `pending` → `hired`
  - All other bids: `pending` → `rejected`
  - Gig status: `open` → `assigned`
- Only one freelancer can be hired per gig
- Secure validation and authorization

### Search & Filter

- Search gigs by title
- Filter by category
- Filter by status (for authenticated users)
- Real-time search with debouncing

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

## Configuration

### Backend Environment Variables

1. The `.env` file has been created with MongoDB connection string
2. Update `JWT_SECRET` with a secure random string for production:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://nikitaa4822_db_user:bob5f32KThdglcer@cluster0.hkyoc8u.mongodb.net/gigflow?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   JWT_EXPIRE=7d
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

### Frontend Environment Variables (Optional)

Create `frontend/.env` if needed:

```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

1. **Start the backend server:**

   ```bash
   cd backend
   npm run dev
   ```

   Server will run on `http://localhost:5000`

2. **Start the frontend development server:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:3000`

### Production Mode

1. **Build the frontend:**

   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user (sets HttpOnly cookie)
- `POST /api/auth/login` - Login user (sets HttpOnly cookie)
- `POST /api/auth/logout` - Logout user (clears cookie)
- `GET /api/auth/me` - Get current user (protected)

### Gigs

- `GET /api/gigs` - Fetch all open gigs (with search query parameter)
  - Query params: `?status=open&category=Web Development&search=react`
- `GET /api/gigs/:id` - Get single gig details
- `POST /api/gigs` - Create a new job post (protected)
- `PUT /api/gigs/:id` - Update gig (protected, owner only)
- `DELETE /api/gigs/:id` - Delete gig (protected, owner only)
- `GET /api/gigs/my-gigs` - Get user's posted gigs (protected)

### Bids

- `POST /api/bids` - Submit a bid for a gig (protected)
- `GET /api/bids/:gigId` - Get all bids for a specific gig (protected, owner only)
- `GET /api/bids/my-bids` - Get user's placed bids (protected)
- `PUT /api/bids/:id` - Update bid (protected, freelancer only, pending only)
- `DELETE /api/bids/:id` - Delete bid (protected, freelancer only, pending only)
- `PATCH /api/bids/:bidId/hire` - Hire a freelancer (protected, client only, atomic update)

## State Management

The application uses **Redux Toolkit** for centralized state management:

- **authSlice**: Manages authentication state (user, loading, error)
- **gigsSlice**: Manages gigs state (gigs list, current gig, user's gigs)
- **bidsSlice**: Manages bids state (user's bids, bids by gig)

All API calls are handled through Redux async thunks, providing:

- Centralized state management
- Optimistic updates
- Error handling
- Loading states

## Security Features

- **HttpOnly Cookies**: JWT tokens stored in HttpOnly cookies (XSS protection)
- **Password Hashing**: bcryptjs with salt rounds
- **Protected Routes**: Frontend and backend route protection
- **Authorization**: Role-based access control
- **Input Validation**: Client and server-side validation
- **CORS**: Configured with credentials support

## User Roles

Roles are **fluid** - any user can:

- Post gigs (act as a Client)
- Bid on gigs (act as a Freelancer)
- Switch between roles seamlessly

## Development

- Backend uses `nodemon` for auto-restart during development
- Frontend uses Vite for fast HMR (Hot Module Replacement)
- Redux DevTools available for state debugging

## License

ISC
