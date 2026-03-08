# Ghazaryan Software - Backend API

Node.js Express-based REST API with TypeScript, PostgreSQL (Prisma ORM), Redis caching, and Stripe payment integration.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Setup database
npm run prisma:generate
npm run prisma:migrate

# Start development server
npm run dev
```

Server runs on `http://localhost:5000` with Swagger docs at `/api/docs`

## Architecture

### Directory Structure

```
src/
├── app.ts                  # Express app initialization
├── server.ts               # Server startup and cron jobs
├── config/                 # Configuration modules
│   ├── env.ts             # Environment variables
│   ├── jwt.ts             # JWT settings
│   ├── passport.ts        # OAuth configuration
│   ├── prisma.ts          # Database connection
│   ├── redis.ts           # Redis client
│   ├── stripe.ts          # Stripe configuration
│   └── swagger.ts         # API documentation
├── modules/               # Feature modules (by domain)
│   ├── admin/             # Admin operations
│   ├── apps/              # App management
│   ├── auth/              # Authentication & authorization
│   ├── categories/        # Category management
│   ├── developer-requests/# Developer inquiries
│   ├── editions/          # App editions/versions
│   ├── news/              # News/updates
│   ├── payment/           # Payment processing
│   ├── promotions/        # Promotions & campaigns
│   ├── reviews/           # Reviews & ratings
│   └── upload/            # File uploads
├── middlewares/           # Express middlewares
│   ├── apiVersion.middleware.ts     # API versioning
│   ├── auth.middleware.ts           # JWT verification
│   ├── avatarUpload.middleware.ts   # Avatar upload
│   ├── error.middleware.ts          # Error handling
│   ├── role.middleware.ts           # Role-based access
│   ├── upload.middleware.ts         # File upload handling
│   ├── validation.middleware.ts     # Request validation
│   └── rateLimit/                   # Rate limiting
├── repositories/          # Data access layer
│   ├── base.repository.ts          # Base repository
│   ├── user.repository.ts          # User queries
│   └── webhook.repository.ts       # Webhook records
├── services/              # Business logic
│   └── rating.service.ts           # Rating calculations
├── types/                 # TypeScript definitions
│   ├── express.d.ts                # Express augmentation
│   ├── types.ts                    # Common types
│   └── index.ts                    # Type exports
└── utils/                 # Utilities
    ├── cache.ts                    # Redis caching
    ├── errors.ts                   # Custom error classes
    ├── sanitizer.ts                # Input sanitization
    └── slugGenerator.ts            # Slug generation
```

### Module Pattern

Each module under `src/modules/` follows this structure:

```
module-name/
├── module.types.ts             # TypeScript interfaces
├── module.controller.ts        # Request handlers
├── module.service.ts           # Business logic
├── module.routes.ts            # Route definitions
└── (optional) module.repository.ts  # Data access
```

**Data Flow**: Routes → Controllers → Services → Repositories → Database/Cache

## API Routes

All routes are versioned under `/api/v1/`:

### Authentication
```
POST   /auth/register            # Register new user
POST   /auth/login               # Login with credentials
GET    /auth/google              # Google OAuth initiation
GET    /auth/google/callback     # OAuth callback
POST   /auth/logout              # Logout
GET    /auth/profile             # Get current user
PUT    /auth/profile             # Update profile
```

### Applications
```
GET    /apps                     # List all apps with pagination
GET    /apps/:appId              # Get app details
POST   /apps                     # Create new app
PUT    /apps/:appId              # Update app
DELETE /apps/:appId              # Soft delete app
GET    /apps/:appId/editions     # Get app editions
```

### Editions (Versions)
```
GET    /apps/:appId/editions     # List editions
POST   /apps/:appId/editions     # Create edition
PUT    /apps/:appId/editions/:editionId  # Update edition
DELETE /apps/:appId/editions/:editionId  # Delete edition
POST   /apps/:appId/editions/link        # Link existing app as edition
```

### Reviews & Ratings
```
GET    /apps/:appId/reviews      # List app reviews
POST   /apps/:appId/reviews      # Create review
PUT    /reviews/:reviewId        # Update review
DELETE /reviews/:reviewId        # Delete review
```

### Categories
```
GET    /categories               # List all categories
POST   /categories               # Create category
PUT    /categories/:categoryId   # Update category
DELETE /categories/:categoryId   # Delete category
```

### Payment
```
POST   /payment/create-session   # Create Stripe session
POST   /payment/webhook          # Stripe webhook handler
GET    /payment/history          # Get user transactions
```

### Admin
```
GET    /admin/users              # List users (with filters)
GET    /admin/stats              # Platform statistics
DELETE /admin/users/:userId      # Delete user
```

### File Upload
```
POST   /upload/:type             # Upload file (type: avatar|mods|etc)
GET    /upload/:type/:filename   # Retrieve file
DELETE /upload/:type/:filename   # Delete file
```

### News
```
GET    /news                     # List news/updates
POST   /news                     # Create news
PUT    /news/:newsId             # Update news
DELETE /news/:newsId             # Delete news
```

### Promotions
```
GET    /promotions               # List active promotions
POST   /promotions               # Create promotion
PUT    /promotions/:promoId      # Update promotion
DELETE /promotions/:promoId      # Delete promotion
```

## Configuration

### Environment Variables

See `.env.example` for complete reference:

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `NODE_ENV` | Environment (dev/prod) | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing key | Yes |
| `JWT_EXPIRATION` | JWT token lifetime | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Yes |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | Yes |
| `STRIPE_SECRET_KEY` | Stripe API key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing key | Yes |
| `REDIS_ENABLED` | Enable Redis caching | No |
| `REDIS_HOST` | Redis host | No |
| `REDIS_PORT` | Redis port | No |

## Database

### Setup
```bash
# Generate Prisma Client
npm run prisma:generate

# Create migrations from schema changes
npm run prisma:migrate

# Apply migrations to database
npm run prisma:deploy

# Reset database (development only - DESTRUCTIVE)
npm run prisma:reset

# Seed database with initial data
npm run seed

# View database in Prisma Studio
npm run prisma:studio
```

### Schema Overview

Key tables:
- **users**: User accounts with authentication
- **apps**: Application listings
- **editions**: App versions/variants
- **categories**: App categories
- **reviews**: User reviews with ratings
- **payments**: Payment transactions
- **news**: Application updates
- **promotions**: Time-based promotions
- **webhooks**: Webhook event logs

See `prisma/schema.prisma` for complete schema.

## Middleware Stack

Request flow through middleware:

1. **CORS** - Cross-origin request handling
2. **Trust Proxy** - For production behind reverse proxy
3. **Body Parser** - JSON/URL-encoded parsing
4. **API Version** - API versioning middleware
5. **Auth** - JWT verification (selective routes)
6. **Validation** - Zod schema validation
7. **Rate Limit** - Request rate limiting
8. **Route Handlers** - Controller logic
9. **Error Handler** - Centralized error handling
10. **404 Handler** - Not found handling

## Error Handling

Custom error classes in `src/utils/errors.ts`:

```typescript
- ApiError          # Base error class
- ValidationError   # Invalid input data
- NotFoundError     # Resource not found
- ConflictError     # Resource conflict
- UnauthorizedError # Authentication failure
- ForbiddenError    # Authorization failure
- DatabaseError     # Database operation failure
```

All errors are normalized and returned as JSON with appropriate HTTP status codes.

## Caching Strategy

Redis is used for:
- Session caching
- Promotional data caching
- View count caching
- User role caching

Cache invalidation happens on:
- Data updates
- Deletion operations
- Scheduled expiration

**Note**: Currently uses `KEYS` pattern for invalidation - should migrate to `SCAN` for production with large datasets.

## Authentication & Authorization

### JWT Flow
1. User logs in or authenticates via OAuth
2. Server issues JWT token (default: 7 days)
3. Client stores token in localStorage
4. Token sent in `Authorization: Bearer <token>` header
5. Middleware verifies token signature and expiration

### Role-Based Access Control
- **USER**: Standard user permissions
- **ADMIN**: Platform administration
- **DEVELOPER**: App creation and management

Roles are checked via `roleMiddleware` on protected routes.

## File Upload

### Supported Types
- `avatar`: User profile pictures (PNG/JPEG/WebP, max 2GB)
- `mods`: Game mods (ZIP files)
- `screenshots`: App screenshots (PNG/JPEG/WebP)
- `archives`: Release archives (ZIP)
- `news`: News image attachments

### Storage
Files are stored in `uploads/<type>/` directory with:
- Unique names for security
- Special naming for archives (using app name)
- Original extension preserved
- MIME type validation

**⚠️ Warning**: 2GB limit is very high for web applications. Consider reducing to appropriate size per use case.

## Payment Integration

### Stripe Flow
1. Create checkout session with line items
2. Redirect customer to Stripe Checkout
3. Stripe posts webhook to `/api/v1/payment/webhook`
4. Server validates webhook signature
5. Payment recorded in database
6. Customer redirected to success/cancel pages

### Webhook Events
- `checkout.session.completed` - Payment successful
- Payment records include duration for tracking

## Development

### Available Scripts
```bash
npm run dev              # Start dev server with hot reload
npm run build           # Compile TypeScript
npm start               # Run compiled server
npm run seed            # Populate database
npm run prisma:studio   # Open Prisma Studio
npm run prisma:migrate  # Create/apply migrations
```

### Type Safety
- Full TypeScript support across codebase
- Express types augmented in `src/types/express.d.ts`
- Zod for runtime validation
- Type-safe Prisma queries

### Code Quality
- ESLint configured (frontend only - backend could be improved)
- TypeScript strict mode enabled
- No explicit `any` types

## Known Issues & TODOs

### 🔴 Critical
- [ ] OAuth callback route mismatch - fix configured callback path
- [ ] JWT secret hardcoded fallback - use required env variable only
- [ ] Admin user filters not applied - implement filter logic in controller

### 🟡 Important
- [ ] Redis uses blocking KEYS operation - migrate to SCAN
- [ ] Upload size limit excessive - reduce to reasonable limit
- [ ] Stripe redirect uses wrong route - use slug-based route
- [ ] Client component overuse in frontend - convert to Server Components

### 🟢 Nice to Have
- [ ] Add unit/integration tests
- [ ] Add structured logging (Pino/Winston)
- [ ] Implement audit logging for admin operations
- [ ] Add caching for popular apps
- [ ] Implement full-text search
- [ ] Add request/response compression
- [ ] Implement cursor-based pagination
- [ ] Add health check endpoint

## Performance Considerations

1. **Database Queries**: Use Prisma's select/include to fetch only needed fields
2. **Caching**: Leverage Redis for frequently accessed data
3. **Rate Limiting**: Protects API from abuse
4. **File Uploads**: Validate early, store efficiently
5. **Pagination**: Implement for large result sets
6. **Connection Pooling**: Prisma handles this automatically

## Security Checklist

Before production:
- [ ] All secrets in environment variables
- [ ] CORS configured for specific origins
- [ ] Rate limiting appropriate for scale
- [ ] JWT secrets are strong/unique
- [ ] Stripe webhooks verified
- [ ] Database credentials secured
- [ ] File upload restrictions enforced
- [ ] SQL injection not possible (using Prisma ORM)
- [ ] Cross-site scripting (XSS) mitigated
- [ ] HTTPS enforced in production

## Testing

Currently no test framework configured. Recommendations:
- Unit tests: Jest
- Integration tests: Supertest
- Load testing: k6 or Apache Bench

## Deployment

### Build
```bash
npm run build
```

### Environment Setup
Copy `.env.example` to `.env` and configure for production.

### Run
```bash
npm start
```

### Docker (Optional)
Create `Dockerfile` to containerize the API for easy deployment.

## Support

For API issues:
1. Check error message in response
2. Review request/response in Swagger docs
3. Check database connection
4. Verify environment variables
5. Check server logs

---

**Last Updated**: March 8, 2026
