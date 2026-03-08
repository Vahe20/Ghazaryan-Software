# Ghazaryan Software - Architecture & Analysis

## Executive Summary

**Ghazaryan Software** is a well-structured full-stack monorepo with a solid foundation but several integration gaps and security/performance concerns that need attention before production deployment.

**Current Maturity**: 7/10
- Solid architecture and code organization
- Missing tests, monitoring, and documentation
- Security gaps that need fixing
- Good technology choices and separation of concerns

---

## Part 1: Current Architecture

### 1.1 Monorepo Structure

```
Ghazaryan-Software/
├── backend/          # Node.js Express API
├── frontend/         # Next.js React Application
├── README.md         # Main documentation
└── (git config)
```

**Strengths:**
- Clean separation of concerns
- Independent deployment possible
- Shared version control
- Easy to reason about

**Considerations:**
- Shared types/models could be extracted to `packages/types/`
- Could benefit from workspace build tooling (Turborepo/PNPM)

### 1.2 Backend Architecture

#### Layer Structure

```
HTTP Request
    ↓
Middleware Stack
    ├── CORS
    ├── Body Parser
    ├── API Version
    ├── Auth (JWT)
    ├── Validation (Zod)
    └── Rate Limit
    ↓
Router
    ↓
Controller Layer
    └── Route handlers / Request validation
    ↓
Service Layer
    └── Business logic / Domain operations
    ↓
Repository Layer
    └── Data access / Prisma queries
    ↓
Database (PostgreSQL) / Cache (Redis)
```

#### Design Patterns

**Modular Feature Architecture:**
Each feature module (`/src/modules/*`) contains:
- `*.routes.ts` - Express Router definition
- `*.controller.ts` - HTTP request handlers
- `*.service.ts` - Business logic (stateless)
- `*.types.ts` - TypeScript types
- (Optional) `*.repository.ts` - Data access

**Advantages:**
- Easy to locate feature logic
- Clear responsibility boundaries
- Easy to test in isolation
- Scalable to many modules

**Current Issues:**
- Inconsistent data access: Some services call Prisma directly, others use repositories
- Controllers don't always validate/apply query parameters
- No abstraction for cache invalidation strategy

#### Data Access Patterns

**Repository Pattern** (Base + Concrete)
```typescript
// base.repository.ts
export abstract class BaseRepository<T> {
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: CreateInput): Promise<T>;
  abstract update(id: string, data: UpdateInput): Promise<T>;
  abstract delete(id: string): Promise<void>;
}
```

**Current State:**
- User & Webhook repositories follow pattern
- Other services bypass repository, call Prisma directly
- Mixed patterns reduce consistency

**Recommendation:**
Create repositories for all data access or commit to direct Prisma calls transparently.

### 1.3 Frontend Architecture

#### Component Hierarchy

```
App (Layout Provider)
  ├── AuthInitializer (Bootstraps auth state)
  ├── Navigation (Header, Sidebar)
  └── Page Route
      ├── Domain Components
      │   ├── ApiHooks (useGetX, useMutateX)
      │   └── Sub-components
      └── Standalone Components
```

#### State Management

**Redux Toolkit:**
- Centralized store with domain slices
- Async thunks for side effects
- Normalized state shape

**RTK Query:**
- Data fetching/caching
- Automatic cache invalidation
- API-first design

**Structure:**
```
store.ts
├── configureStore([
│   appsSlice,      // Domain-specific state
│   authSlice,
│   adminSlice,
│   ...
│   // + RTK Query injectEndpoints()
│ ])
```

**Issues:**
- `src/services/` exists but empty - confusing
- No clear guidelines on when to use slices vs RTK Query
- Over-reliance on client-side rendering reduces SSR benefits

### 1.4 Data Synchronization

**Database Models** (Prisma)
```
User → Apps → Editions
                 ↓
        Reviews, Payments, Screenshots

Categories ← Apps

News ← Apps

Promotions (scheduled activation/deactivation)

WebhookLog (audit trail)
```

**Key Relationships:**
- Apps support parent-child (editions)
- Soft deletes via `deletedAt` field
- User-based authorization (authorId check)

---

## Part 2: Technology Stack Assessment

### 2.1 Backend Stack

| Layer | Technology | Version | Assessment |
|-------|-----------|---------|------------|
| **Runtime** | Node.js | 18+ | ✅ Modern, good support |
| **Framework** | Express.js | 5.0 | ✅ Latest version, stable |
| **Language** | TypeScript | 5 | ✅ Strict mode enabled |
| **Database** | PostgreSQL | 14+ | ✅ Reliable, ACID compliance |
| **ORM** | Prisma | 7.3 | ✅ Type-safe, great DX |
| **Auth** | JWT + Passport | Modern | ✅ Industry standard |
| **Cache** | Redis | 5.10 | ✅ Optional but good |
| **Payments** | Stripe SDK | 20.4 | ✅ Official, well-maintained |
| **Validation** | Zod | 4.3 | ✅ Runtime validation |
| **Uploads** | Multer | 2.0 | ⚠️ No virus scanning |
| **API Docs** | Swagger/OpenAPI | 6.2 | ✅ Auto-generated docs |

**Gaps:**
- No logging framework (console.log only)
- No error tracking (Sentry, etc.)
- No request tracing
- No performance monitoring

### 2.2 Frontend Stack

| Layer | Technology | Version | Assessment |
|-------|-----------|---------|------------|
| **Framework** | Next.js | 16 | ✅ App Router, latest |
| **UI Layer** | React | 19 | ✅ Latest version |
| **State** | Redux Toolkit | 2.11 | ✅ Modern Redux |
| **Data** | RTK Query | (included) | ✅ Built-in data layer |
| **Language** | TypeScript | 5 | ✅ Full type safety |
| **Forms** | React Hook Form | 7.71 | ✅ Lightweight, performant |
| **Styling** | SCSS | 1.97 | ✅ CSS preprocessing |
| **HTTP** | Axios | 1.13 | ⚠️ Unused (RTK Query primary) |
| **Modal** | react-modal | 3.16 | ⚠️ Alternatives exist |

**Gaps:**
- No form validation schema (consider Zod for consistency)
- No error boundaries
- No loading/error states standardization
- No accessibility (a11y) testing

---

## Part 3: Critical Issues & Security Concerns

### 🔴 CRITICAL (Fix Before Production)

#### 1. JWT Secret Hardcoded Fallback
**File**: `backend/src/config/env.ts`
```typescript
JWT_SECRET: process.env.JWT_SECRET || 'insecure-fallback-key', // ❌ DANGER
```
**Risk**: If env var missing, anyone knowing default can forge tokens
**Fix**: 
```typescript
JWT_SECRET: (() => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET env variable is required');
  }
  return process.env.JWT_SECRET;
})(),
```

---

#### 2. Tokens Stored in localStorage
**Risk**: Vulnerable to XSS attacks
**Current**: Frontend stores JWT in localStorage
**Better Alternatives**:
1. **HTTP-Only Cookies** (recommended)
   - Inaccessible to JavaScript
   - Automatically sent with requests
   - Requires CSRF protection

2. **Memory Storage** (with refresh)
   - Token lost on page reload
   - Need refresh token rotation

**Migration Path**:
1. Add refresh token endpoint
2. Store refresh token in HTTP-only cookie
3. Keep access token in memory
4. Add CSRF middleware

---

#### 3. OAuth Callback Path Mismatch
**Config**: `backend/src/config/passport.ts:20`
```typescript
callbackURL: 'http://localhost:5000/api/auth/google/callback'
```
**Actual Route**: `backend/src/modules/auth/auth.routes.ts`
```typescript
// Mounted under /api/v1/
router.get('/google/callback', handleGoogleCallback);
```
**Issue**: Real URL is `/api/v1/auth/google/callback`, not `/api/auth/...`
**Fix**: Update or mount routes differently
```typescript
// Option 1: Update callback URL
callbackURL: 'http://localhost:5000/api/v1/auth/google/callback'

// Option 2: Mount auth outside version constraint
app.use('/api/auth', authRouter); // before versioning
```

---

#### 4. TypeScript Build Errors Ignored
**File**: `frontend/next.config.ts:6`
```typescript
typescript: {
  ignoreBuildErrors: true, // ⚠️ Hidden type safety issues
}
```
**Risk**: Type errors in production, hard-to-debug issues
**Fix**: Remove this setting, fix all type errors
```typescript
// next.config.ts
const config: NextConfig = {
  // Remove typescript ignore setting
  // Let build fail if there are type errors
};
```

---

### 🟡 HIGH PRIORITY (Fix Soon)

#### 5. Admin Filters Not Implemented
**File**: `backend/src/modules/admin/admin.controller.ts:9`
```typescript
// Query params read but never used
const { role, status, search } = req.query;
const users = await getUsers(); // ❌ Filters ignored
```
**Fix**: Pass filters to service
```typescript
const users = await getUsers({
  role: role as string,
  status: status as string,
  search: search as string,
});
```

---

#### 6. Payment Redirect Wrong Route
**File**: `backend/src/modules/payment/payment.service.ts:243`
```typescript
// Stripe redirect: /apps/{id}
success_url: `${process.env.FRONTEND_URL}/apps/${appId}`,
```
**Frontend Route** (`frontend/app/apps/[slug]/page.tsx`)
```typescript
// Actually uses slug, not ID
```
**Issue**: Stripe redirects to wrong URL after payment
**Fix**: Use slug-based URL
```typescript
// Get slug from app
const { slug } = await prisma.apps.findUnique({ where: { id: appId } });
success_url: `${process.env.FRONTEND_URL}/apps/${slug}`,
```

---

#### 7. Large Upload Size Limit
**File**: `backend/src/middlewares/upload.middleware.ts:84`
```typescript
limits: {
  fileSize: 2 * 1024 * 1024 * 1024, // 2GB - Too Large!
}
```
**Issues**:
- DOS attack risk
- Storage costs
- Memory pressure
- Slow uploads

**Recommended Limits**:
- Avatar: 5MB
- Screenshots: 10MB
- Mods: 500MB
- Archives: 1GB (with admin approval)

**Fix**:
```typescript
const MAX_SIZES = {
  avatar: 5 * 1024 * 1024,
  screenshots: 10 * 1024 * 1024,
  mods: 500 * 1024 * 1024,
  archives: 1024 * 1024 * 1024,
};
limits: {
  fileSize: MAX_SIZES[type],
}
```

---

#### 8. Redis Uses Blocking KEYS Operation
**File**: `backend/src/utils/cache.ts:46`
```typescript
const keys = await redis.keys(`${prefix}:*`); // ❌ Blocks all operations
```
**Risk**: Causes Redis hangs on large datasets
**Fix**: Use SCAN instead
```typescript
async function* scanKeys(pattern: string) {
  let cursor = '0';
  do {
    const [newCursor, keys] = await redis.scan(cursor, 'MATCH', pattern);
    cursor = newCursor;
    for (const key of keys) yield key;
  } while (cursor !== '0');
}
```

---

### 🟠 MEDIUM PRIORITY

#### 9. No Input Sanitization
**Risk**: Potential XSS if data displayed without escaping
**Current**: Zod validates types, not security
**Fix**: Add sanitization library
```bash
npm install xss-clean
```

---

#### 10. CORS Too Permissive in Development
**File**: `backend/src/app.ts:40`
```typescript
origin: function (origin, callback) {
  if (!origin || allowedOrigins.includes(origin) || isDevelopment) {
    callback(null, true); // Allow all in dev
  }
}
```
**Risk**: Easy to forget restricting in production
**Fix**: Fail-safe approach
```typescript
if (process.env.NODE_ENV === 'production' && isDevelopment) {
  throw new Error('isDevelopment flag detected in production!');
}
```

---

#### 11. No Stripe Webhook Verification Logging
**Issue**: Can't debug webhook failures
**Fix**: Add logging
```typescript
webhook.on('verified', () => console.log('✅ Webhook verified'));
webhook.on('failed', (err) => console.error('❌ Webhook failed:', err));
```

---

## Part 4: Architecture Improvements

### 4.1 Missing Cross-Cutting Concerns

#### Logging & Monitoring
```
Current: console.log() only

Needed:
├── Structured logging (Pino/Winston)
├── Error tracking (Sentry)
├── Performance monitoring (APM)
├── Request tracing (OpenTelemetry)
└── Audit logging
```

**Implementation:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
  },
});

app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    userId: req.user?.id,
  });
  next();
});
```

#### Request/Response Compression
```typescript
import compression from 'compression';

app.use(compression()); // Reduces response size by 60-80%
```

#### Request Size Limits
```typescript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb' }));
```

#### Security Headers
```typescript
import helmet from 'helmet';

app.use(helmet()); // Sets security headers
```

#### Health Checks
```typescript
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

### 4.2 Backend Improvements

#### Add Background Job Queue
**Current**: Cron jobs for promotions only
**Better**: BullMQ for reliable job processing

```typescript
import { Queue, Worker } from 'bullmq';

const promotionQueue = new Queue('promotions', {
  connection: redisClient,
});

new Worker('promotions', async (job) => {
  await deactivateExpiredPromotions();
}, { connection: redisClient });

// Schedule job
await promotionQueue.add('deactivate', {}, {
  repeat: { cron: '0 * * * *' }, // Every hour
});
```

#### Add Database Connection Pooling Status
```typescript
// Prisma handles this, but monitor:
prisma.$queryRaw`SELECT count(*) FROM pg_stat_activity`
```

#### Paginate Heavy Queries
```typescript
// Current: SELECT * FROM apps
// Better: Offset-limit or cursor pagination

interface PaginationParams {
  limit: number;
  cursor?: string; // Last ID from previous page
}

async function getApps({ limit, cursor }: PaginationParams) {
  return prisma.apps.findMany({
    where: { ..., id: { gt: cursor } },
    take: limit + 1, // Fetch one more to know if more exists
  });
}
```

#### Add Request Validation Middleware Standardization
Current: Each controller validates differently
Better: Consistent pattern

```typescript
// middleware/validate.ts
export const validate = (schema: z.ZodSchema) => 
  (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      res.status(400).json({ errors: error.errors });
    }
  };

// Usage
router.post('/', validate(createAppSchema), createAppController);
```

### 4.3 Frontend Improvements

#### Migrate to Server Components
```typescript
// Current: Client-side rendering
export default function AppsPage() { ... }

// Better: Server-side data fetching
export default async function AppsPage() {
  const apps = await fetch('/api/v1/apps');
  return <AppsList apps={apps} />;
}
```

Benefits:
- Faster initial load (no JS needed)
- Secure API calls (keys stay on server)
- Reduced bundle size
- Better SEO

#### Add Error Boundaries
```typescript
// components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Try refreshing.</div>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary>
  <AppsPage />
</ErrorBoundary>
```

#### Add Loading/Skeleton States
```typescript
// components/shared/Skeleton.tsx
export function AppCardSkeleton() {
  return (
    <div className="skeleton">
      <div className="skeleton-image" />
      <div className="skeleton-text" />
    </div>
  );
}

// Usage
{isLoading ? <AppCardSkeleton /> : <AppCard />}
```

#### Implement TypeScript Strict Mode
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

---

## Part 5: Incomplete & Missing Features

### Features with Empty Implementation

1. **Frontend `/editions` route**
   - Directory exists: `frontend/app/editions/`
   - No page.tsx or implementation
   - Decision: Complete or remove

2. **Frontend `/src/services/`**
   - Directory exists
   - Completely empty
   - Decision: Implement or delete

3. **Tests**
   - No test files found
   - No test configuration
   - Recommendation: Add Jest + Supertest (backend), Jest + RTL (frontend)

4. **CI/CD Pipeline**
   - No GitHub Actions configured
   - No pre-commit hooks
   - Recommendation: Add lint, type-check, test, build gates

### Missing Critical Features

1. **Audit Logging**
   - No tracking of admin actions
   - No data change history
   - Recommendation: Add to all mutations

2. **Full-Text Search**
   - No search index for apps
   - FTS could use PostgreSQL native support

3. **API Rate Limiting**
   - Basic implementation present
   - Could be more sophisticated (per-user vs global)

4. **Cache Invalidation Strategy**
   - Ad-hoc cache clearing via KEYS
   - No systematic cache warming
   - No TTL strategy

---

## Part 6: Scalability Considerations

### Current Bottlenecks

1. **Database**
   - No query indexing strategy documented
   - N+1 query risk in Prisma includes
   - Hot tables: apps (popularity counter), reviews

2. **Caching**
   - Redis KEYS operation blocks
   - No cache warming strategy
   - Missing rate-limit cache optimization

3. **File Storage**
   - Local filesystem only
   - Should migrate to S3/cloud storage for scale
   - Current 2GB limit unsustainable at scale

4. **Session Management**
   - No session clustering for horizontal scaling
   - Redis can help but not configured

### Scaling Recommendations

**Phase 1: Optimize Current**
- Add database indexes
- Fix KEYS → SCAN
- Reduce upload limits
- Add query caching

**Phase 2: Distribute**
- Extract cache layer
- Move file storage to S3
- Add async job processing (BullMQ)
- Implement database read replicas

**Phase 3: Observe & Adapt**
- Add performance monitoring
- Scale components independently
- Add CDN for assets
- Implement GraphQL for flexible querying

---

## Part 7: Testing Strategy

### Current Status
❌ No tests found

### Recommended Coverage

**Backend**
```
Routes              → Supertest
Controllers         → Jest mocks
Services            → Jest
Repositories        → Jest + database fixtures
Middleware          → Jest
Error handling      → Jest
```

**Frontend**
```
Components          → React Testing Library
Hooks               → @testing-library/react-hooks
Redux slices        → Redux mocking
RTK Query           → Mock Service Worker (msw)
Pages               → E2E (Cypress/Playwright)
Forms               → React Testing Library
```

### Test Setup

**Backend (`package.json`)**
```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "supertest": "^6.0.0",
    "@testing-library/node": "^latest"
  },
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**Example Backend Test**
```typescript
describe('App Controller', () => {
  it('should list apps with pagination', async () => {
    const response = await request(app)
      .get('/api/v1/apps?page=1&limit=10')
      .expect(200);
    
    expect(response.body).toHaveProperty('items');
    expect(response.body.items).toBeInstanceOf(Array);
  });
});
```

---

## Part 8: Deployment Architecture

### Current State
No deployment documentation

### Recommended Setup

**Development**
```
Developer Machine
  → Docker Compose
    ├── Node.js API
    ├── PostgreSQL
    ├── Redis
    └── Mailhog (email testing)
```

**Docker Compose Example**
```yaml
services:
  api:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [db, redis]
  
  web:
    build: ./frontend
    ports: ["3000:3000"]
  
  db:
    image: postgres:15
    volumes: [pgdata:/var/lib/postgresql/data]
  
  redis:
    image: redis:7-alpine
```

**Staging/Production**
```
┌─────────────────┐
│   Git Push      │
└────────┬────────┘
         │
    ┌────▼────┐
    │CI/CD    │ (GitHub Actions)
    └────┬────┘
         │
    ┌────▼──────────────┐
    │ Test + Build      │
    └────┬──────────────┘
         │
┌────────▼──────────────┐
│ Docker Registry       │ (ghcr.io)
└────────┬──────────────┘
         │
    ┌────▼────────┐
    │ Deploy       │
    └─────────────┘
         │
    ┌────▼────┐
    │ Kubernetes/  │
    │ Docker      │
    │ Swarm       │
    └────────────┘
```

**Environment Progression**
```
Local Dev
  ↓ (git push)
Pull Request (test + preview)
  ↓ (merge)
Staging (full test suite)
  ↓ (approval)
Production (blue-green deploy)
```

---

## Part 9: Monitoring & Observability

### Gaps

- No structured logging
- No error tracking
- No performance monitoring
- No synthetic monitoring

### Recommendations

**Logging Stack**
```
App Logs → Pino/Winston → Docker Volumes → ELK/Datadog
```

**Error Tracking**
```
Sentry → Email Alerts + Dashboard
```

**Performance Monitoring**
```
Frontend: Web Vitals → Analytics
Backend: APM (Datadog/New Relic) → Dashboards
Database: Slow Query Log → Alerts
```

**Health Monitoring**
```
/health endpoint → Uptime monitoring service
Container health checks
Database connection checks
Redis connection checks
```

---

## Part 10: Recommendations Summary

### 🔴 CRITICAL (Week 1)
- [ ] Fix JWT secret fallback
- [ ] Fix OAuth callback path mismatch
- [ ] Enable TypeScript build errors
- [ ] Fix payment Stripe redirect URL
- [ ] Reduce upload size limits

### 🟡 HIGH (Month 1)
- [ ] Implement admin filters
- [ ] Migrate Redux KEYS → SCAN
- [ ] Add structured logging
- [ ] Add error tracking (Sentry)
- [ ] Migrate auth tokens to HTTP-only cookies

### 🟠 MEDIUM (Quarter 1)
- [ ] Add comprehensive tests
- [ ] Set up CI/CD pipeline
- [ ] Add input sanitization
- [ ] Implement error boundaries (frontend)
- [ ] Add cache warming strategy

### 🟢 NICE TO HAVE (Ongoing)
- [ ] Migrate eligible pages to Server Components
- [ ] Add full-text search
- [ ] Implement audit logging
- [ ] Add monitoring & observability
- [ ] Background job queue (BullMQ)
- [ ] CDN for static assets

---

## Conclusion

Ghazaryan Software has a **solid architectural foundation** with good separation of concerns and modern technology choices. However, several **security and integration issues** must be addressed before production use. The project would benefit greatly from:

1. **Testing** - Comprehensive test coverage
2. **Observability** - Logging, monitoring, error tracking
3. **Documentation** - Architecture guides, runbooks
4. **Security** - Address identified vulnerabilities
5. **Performance** - Cache optimization, pagination, caching

With these improvements, the application will be production-ready and maintainable at scale.

---

**Last Updated**: March 8, 2026
**Assessment By**: Copilot Architecture Review
