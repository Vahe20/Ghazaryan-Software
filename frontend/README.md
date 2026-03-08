# Ghazaryan Software - Frontend

Modern React application built with Next.js 16, TypeScript, Redux Toolkit, and RTK Query for state management and API communication.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Start development server
npm run dev
```

Application runs on `http://localhost:3000`

## Architecture

### Directory Structure

```
app/                          # Next.js App Router
├── layout.tsx                # Root layout
├── page.tsx                  # Home page
├── admin/                    # Admin panel routes
│   ├── layout.tsx
│   ├── page.tsx
│   ├── apps/                 # Admin app management
│   ├── categories/           # Admin categories
│   ├── news/                 # Admin news management
│   ├── orders/               # Admin orders view
│   └── users/                # Admin user management
├── apps/                     # App listing pages
│   ├── page.tsx             # Apps list
│   └── [slug]/page.tsx      # App detail page
├── auth/                     # Authentication pages
│   ├── page.tsx             # Login page
│   └── callback/            # OAuth callback
├── editions/                 # App editions (empty - incomplete)
├── library/                  # User library/dashboard
│   └── page.tsx
└── profile/                  # User profile
    └── page.tsx

src/
├── app/                      # Redux store
│   ├── store.ts             # Store configuration
│   ├── hooks.ts             # useAppDispatch, useAppSelector
│   └── createAppSlice.ts    # App slice setup
├── components/              # Reusable React components
│   ├── admin/               # Admin-specific components
│   ├── apps/                # App management components
│   ├── auth/                # Authentication UI
│   ├── home/                # Home page components
│   ├── layout/              # Layout components (header, nav)
│   ├── library/             # Library/dashboard components
│   ├── profile/             # Profile components
│   ├── providers/           # Context providers
│   └── shared/              # Shared components (buttons, forms, etc)
├── config/                  # Configuration
├── features/                # Redux features
│   ├── api/                # RTK Query API endpoints
│   │   ├── appsApi.ts      # App endpoints
│   │   ├── authApi.ts      # Auth endpoints
│   │   ├── adminApi.ts     # Admin endpoints
│   │   ├── paymentApi.ts   # Payment endpoints
│   │   └── baseApi.ts      # Base query configuration
│   └── slices/             # Redux slices (auth, ui, etc)
├── hooks/                  # Custom React hooks
│   ├── useAsyncAction.ts   # Async action helper
│   ├── useDebounce.ts      # Debounce hook
│   └── usePagination.ts    # Pagination logic
├── lib/                    # Utility functions
│   └── utils.ts
├── services/               # Services (currently empty/unused)
├── styles/                 # Global styles
│   ├── main.scss          # Main stylesheet
│   ├── _global.scss       # Global styles
│   ├── _normalize.scss    # Browser normalization
│   └── helpers/           # SCSS helpers/mixins
└── types/                 # TypeScript type definitions
    ├── api.types.ts       # API response types
    ├── auth.types.ts      # Authentication types
    ├── app.types.ts       # App/edition types
    └── index.ts           # Exported types

public/                    # Static assets
```

## Configuration

### Environment Variables (`.env.local`)

```
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1

# Stripe (Payment)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# (Optional) Analytics, error tracking, etc.
NEXT_PUBLIC_GA_ID=...
```

### Build Configuration

`next.config.ts`:
- TypeScript checking disabled during build (⚠️ risky)
- Image optimization enabled
- SCSS module support
- Compression and optimization configured

## State Management

### Redux Toolkit Architecture

**Store Structure:**
```
store/
├── auth          # Authentication state
│   └── user, token, isLoading, error
├── ui            # UI state
│   └── sidebarOpen, theme, notifications
├── apps          # Apps listing
│   └── items, filters, pagination
└── (other domain slices...)
```

### RTK Query API Slices

Centralized API clients for each domain:

```typescript
// Usage example
const { data: apps, isLoading, error } = useGetAppsQuery({
  page: 1,
  limit: 20,
});

const [createApp] = useCreateAppMutation();
```

**API Endpoints:**
- `appsApi.ts` - App queries and mutations
- `authApi.ts` - Authentication
- `adminApi.ts` - Admin operations
- `paymentApi.ts` - Payment processing
- `reviewsApi.ts` - Reviews and ratings
- `categoriesApi.ts` - Categories
- `newsApi.ts` - News/updates

### Custom Hooks

- `useAppDispatch()` - Typed dispatch
- `useAppSelector()` - Typed selector with auto-complete
- `useAsyncAction()` - Wrapper for async thunks
- `useDebounce()` - Debounced value
- `usePagination()` - Pagination state management

## Components

### Page Components
- Client-side rendered (marked with `"use client"`)
- Compose domain-specific components
- Handle route-level state

### Domain Components
Organized by feature:
- **Admin**: Admin panel UI, user management, analytics
- **Apps**: App cards, listings, detail views
- **Auth**: Login form, OAuth buttons, register
- **Layout**: Header, navigation, sidebar
- **Library**: User's app library, downloads
- **Profile**: User profile form, settings
- **Shared**: Reusable UI: buttons, forms, modals, cards

### Component Patterns

**Page Component:**
```typescript
export default function AppsPage() {
  const { data: apps } = useGetAppsQuery({ page: 1 });
  
  return (
    <div className="apps-layout">
      <AppsList apps={apps} />
    </div>
  );
}
```

**Feature Component:**
```typescript
export function AppCard({ app }: { app: App }) {
  return (
    <div className="app-card">
      <img src={app.iconUrl} alt={app.name} />
      <h3>{app.name}</h3>
      <p>{app.shortDesc}</p>
    </div>
  );
}
```

## Styling

### SCSS Organization

```
styles/
├── main.scss              # Entry point (imports all)
├── _global.scss           # Global styles
├── _normalize.scss        # Browser normalization
└── helpers/
    ├── _variables.scss    # Colors, fonts, spacing
    ├── _mixins.scss       # Reusable SCSS mixins
    └── _functions.scss    # SCSS functions
```

### CSS Modules

Component-specific styles via CSS Modules:
```
components/apps/AppCard.tsx
components/apps/AppCard.module.scss
```

```scss
.card {
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### Usage
```typescript
import styles from './AppCard.module.scss';

export function AppCard() {
  return <div className={styles.card}>...</div>;
}
```

## Authentication Flow

1. **Login Page** (`/auth`)
   - Email/password form or Google button
   - Form submits to backend `/auth/login`
   - Stores JWT token in localStorage

2. **OAuth Callback** (`/auth/callback`)
   - Handles Google OAuth callback
   - Exchanges code for token
   - Stores token and redirects

3. **Auth State** (Redux)
   - Persists user & token
   - Available to all components

4. **Protected Routes**
   - Middleware checks auth state
   - Redirects to login if needed
   - AuthInitializer component bootstraps auth on app load

### Security Notes
⚠️ **Current**: Tokens stored in localStorage (XSS vulnerable)
✅ **Better**: Use HTTP-only cookies with CSRF protection

## API Integration

### Base Query Setup

`features/api/baseApi.ts` configures RTK Query:
- Base URL from environment
- Authorization header injection
- Error handling
- Request/response transformation

### Query Hooks

```typescript
// Read operations
const { data, isLoading, error } = useGetAppsQuery();

// Mutations
const [createApp, { isLoading }] = useCreateAppMutation();

// Usage
const handleCreate = async (data) => {
  await createApp(data).unwrap();
};
```

### Request Validation

Zod schemas on backend validate all requests.
Frontend can mirror schemas or validate locally with React Hook Form.

## Forms

### React Hook Form Integration

```typescript
import { useForm } from 'react-hook-form';

export function AppForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name', { required: true })} />
      {errors.name && <span>Name required</span>}
    </form>
  );
}
```

## Development

### Scripts
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm start        # Run production build locally
npm run lint     # Run ESLint
```

### Hot Reload
Changes to files trigger instant refresh via Next.js Fast Refresh.

### Type Checking
```bash
npm run lint  # Checks types via ESLint
```

**Note**: TypeScript build errors are currently ignored in `next.config.ts`! This is risky and should be enabled.

## Known Issues & TODOs

### 🔴 Critical
- [ ] Tokens stored in localStorage (XSS risk) - migrate to HTTP-only cookies
- [ ] TypeScript errors ignored in build - enable type checking
- [ ] Component overuse of "use client" - migrate eligible components to Server Components

### 🟡 Important
- [ ] Empty `/editions` route - implement or remove
- [ ] Unused `/src/services/` directory - remove or implement
- [ ] No error boundaries - add error handling components
- [ ] LoadingState components missing - improve loading UX
- [ ] No loading skeletons - add skeleton screens

### 🟢 Nice to Have
- [ ] Add tests (Jest + React Testing Library)
- [ ] Add E2E tests (Cypress/Playwright)
- [ ] Migrate to Server Components (better performance)
- [ ] Add error tracking (Sentry)
- [ ] Implement PWA features
- [ ] Add dark mode
- [ ] Improve accessibility (a11y)
- [ ] Add analytics

## Performance Optimization

### Current Issues
1. **Many Client Components**: Pages marked "use client" reduce SSR benefits
2. **Bundle Size**: React 19 + Redux + RTK Query + Axios all loaded
3. **Image Optimization**: Not explicitly configured
4. **Code Splitting**: Default Next.js behavior (good)

### Recommendations
1. Convert eligible pages to static generation or Server Components
2. Remove unused dependencies (Axios?)
3. Implement image optimization with next/image
4. Add code splitting for large components
5. Lazy load modal dialogs and heavy components

### Metrics to Monitor
```
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)
- Bundle size
```

## Accessibility

Current accessibility status:
- Basic semantic HTML
- Form labels present
- Color contrast acceptable
- Missing ARIA labels in some areas
- No keyboard navigation optimizations

Recommendations:
- Add skip navigation links
- Improve form accessibility
- Add ARIA labels
- Test with screen readers
- Ensure keyboard navigation

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## SEO

`next.config.ts` includes metadata configuration. Update:
- `title` - Page title
- `description` - Meta description
- `keywords` - Meta keywords
- `og:image` - Open Graph image

Use Next.js Metadata API:
```typescript
export const metadata = {
  title: 'Apps',
  description: 'Browse and download applications',
};
```

## Deployment

### Vercel (Recommended for Next.js)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy automatically on push

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Self-Hosted
```bash
npm run build
npm start
```

Access at `http://your-domain:3000`

## Troubleshooting

### Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### API Connection Issues
1. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
2. Check backend is running on correct port
3. Verify CORS configuration in backend
4. Check network tab in DevTools

### Build Errors
1. Clear `.next` folder: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npm run lint`

## Testing

### Setup Jest
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Example Test
```typescript
import { render, screen } from '@testing-library/react';
import { AppCard } from './AppCard';

test('renders app name', () => {
  const app = { id: '1', name: 'Test App' };
  render(<AppCard app={app} />);
  expect(screen.getByText('Test App')).toBeInTheDocument();
});
```

## Contributing

1. Create feature branch from `main`
2. Follow component patterns and directory structure
3. Use TypeScript strictly
4. Test changes locally
5. Submit PR with description

## Support

For issues:
1. Check localStorage (Redux DevTools)
2. Review network tab (RTK Query calls)
3. Check browser console for errors
4. Verify backend is responding
5. Check environment variables

---

**Last Updated**: March 8, 2026
