# Ghazaryan Software Platform

A comprehensive full-stack application for managing, distributing, and monetizing software applications with a modern tech stack built on Express.js, Next.js, and PostgreSQL.

## Overview

Ghazaryan Software is a feature-rich platform that enables developers to:
- Upload and distribute their applications
- Manage multiple editions/versions of applications
- Implement secure authentication (JWT + Google OAuth)
- Process payments via Stripe integration
- Manage user roles and permissions
- Track reviews and ratings
- Organize content with categories and tags
- Handle file uploads with comprehensive media management

## Project Structure

```
├── backend/                 # Node.js Express API
│   ├── src/
│   │   ├── modules/        # Feature modules (auth, apps, payment, etc.)
│   │   ├── middlewares/    # Cross-cutting concerns
│   │   ├── config/         # Configuration (DB, JWT, OAuth, etc.)
│   │   ├── repositories/   # Data access layer
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utilities and helpers
│   ├── prisma/             # Database schema and migrations
│   └── uploads/            # File storage
│
├── frontend/               # Next.js React Application
│   ├── app/               # App Router pages and layouts
│   ├── src/
│   │   ├── components/    # Reusable React components
│   │   ├── features/      # API clients & Redux slices
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   ├── lib/           # Utilities
│   │   └── styles/        # SCSS styles
│   └── public/            # Static assets
```

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js 5
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport.js (Google OAuth 2.0)
- **Caching**: Redis
- **Payment Processing**: Stripe API
- **File Handling**: Multer
- **Documentation**: Swagger/OpenAPI
- **Task Scheduling**: node-cron
- **Validation**: Zod

### Frontend
- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: SCSS/Sass
- **Forms**: React Hook Form
- **HTTP Client**: Axios (configured but primarily uses RTK Query)
- **TypeScript**: Full type support

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis (optional, for caching)
- Google OAuth 2.0 credentials
- Stripe API keys

### Installation & Setup

#### Backend
```bash
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Seed database
npm run seed

# Start development server
npm run dev
```

Backend runs on `http://localhost:5000`
API Documentation: `http://localhost:5000/api/docs`

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Frontend runs on `http://localhost:3000`

## Environment Variables

### Backend (`backend/.env`)
```
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ghazaryan

# Redis
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRATION=7d

# OAuth (Google)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Frontend (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Key Features

### Authentication & Authorization
- JWT-based authentication
- Google OAuth 2.0 integration
- Role-based access control (Admin, User, Developer)
- Secure session management

### Application Management
- Create and manage apps with detailed metadata
- Support for multiple editions/versions per app
- Rich media support (icons, covers, screenshots)
- Category and tag organization
- Soft delete functionality for data recovery

### Monetization
- Stripe payment integration
- Edition/version pricing
- Secure payment webhooks
- Transaction history

### Content Management
- News/updates system
- Reviews and ratings
- Promotions with scheduled activation/deactivation
- Developer request tracking

### Media Management
- File upload support (images, archives, mods)
- Organized storage by type
- Size validation and security checks
- CDN-ready file structure

## API Documentation

The API follows RESTful principles with versioning:

```
/api/v1/auth/          # Authentication routes
/api/v1/apps/          # App management
/api/v1/editions/      # Edition management
/api/v1/categories/    # Category management
/api/v1/reviews/       # Reviews system
/api/v1/payment/       # Payment processing
/api/v1/news/          # News management
/api/v1/promotions/    # Promotions
/api/v1/admin/         # Admin operations
/api/v1/upload/        # File uploads
```

Interactive API documentation available at `/api/docs` when the server is running.

## Database Schema

Key entities:
- **Users**: User accounts with authentication info
- **Apps**: Main application listings
- **Editions**: Versions/variants of apps
- **Categories**: App categorization
- **Reviews**: User reviews and ratings
- **Payments**: Transaction records
- **News**: App updates and announcements
- **Promotions**: Marketing campaigns with time-based activation

## Development

### Running Tests
```bash
# Backend (currently no tests configured)
cd backend
npm test

# Frontend (currently no tests configured)
cd frontend
npm test
```

### Database Management
```bash
# View database in Prisma Studio
npm run prisma:studio

# Reset database (dev only - DESTRUCTIVE)
npm run prisma:reset

# Check migration status
npm run prisma:migrate --status
```

### Building for Production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## Project Status & Known Issues

### ✅ Implemented Features
- Core API with modular architecture
- Database schema with Prisma
- Authentication system (JWT + OAuth)
- Payment processing infrastructure
- File upload system
- Admin interface structure
- Rate limiting
- CORS configuration

### ⚠️ Known Issues
1. **OAuth Callback Path**: Route mounted under `/api/v1/` but callback configured for `/api/auth/google/callback`
2. **Admin Filters**: User filter parameters are read but not actually applied in controller
3. **Payment Redirect**: Stripe redirect uses app ID instead of slug-based frontend route
4. **Redis Optimization**: Uses `KEYS` pattern (blocking) instead of `SCAN` for large datasets
5. **Upload Size**: 2GB limit may be excessive and stress server resources
6. **Security**: JWT secret has hardcoded fallback in code; tokens stored in localStorage
7. **Build Configuration**: TypeScript build errors ignored in production build
8. **Frontend**: Client components reduce SSR benefits; many components marked "use client"

### 🔄 Incomplete Features
- Frontend `/editions` route exists but is empty
- Frontend `/src/services/` directory exists but is unused
- No test coverage (unit, integration, or E2E)
- No CI/CD pipeline configured
- No Swagger JSDoc comments in controllers

### 📚 Recommendations for Improvement

**Priority 1 (Critical Security)**
- Fix JWT secret management (remove hardcoded fallback)
- Fix OAuth callback route mismatch
- Implement HTTP-only secure cookies for auth tokens
- Enable TypeScript checks in production build

**Priority 2 (Performance & Reliability)**
- Replace Redis KEYS with SCAN operation
- Reduce upload size limits
- Implement background job queue (BullMQ)
- Add response compression middleware
- Convert eligible pages to Server Components

**Priority 3 (Quality & Observability)**
- Add comprehensive test coverage
- Add structured logging and error tracking
- Implement monitoring and metrics
- Set up CI/CD pipeline with quality gates
- Create audit logging for admin actions

**Priority 4 (Features & UX)**
- Implement full-text search for apps
- Add pagination optimization with cursor-based navigation
- Complete editions route implementation
- Add error boundaries for better error handling
- Implement data cache warming strategies

**Priority 5 (Documentation)**
- Add architecture documentation
- Document API endpoints and usage patterns
- Create contributor guidelines
- Add troubleshooting guide

## Security Considerations

⚠️ **Before deploying to production, ensure:**
- All environment variables are properly configured (no defaults)
- CORS origin is restricted to your domain
- Stripe webhook signatures are verified
- Database credentials are secured
- JWT secrets are strong and stored securely
- File upload restrictions are enforced
- Rate limiting is appropriate for your scale

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Ensure code follows TypeScript best practices
4. Test your changes thoroughly
5. Submit a pull request with clear description

## License

ISC

## Support

For issues, questions, or contributions, please create an issue in the repository.

---

**Last Updated**: March 8, 2026
