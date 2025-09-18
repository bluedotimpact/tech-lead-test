# tRPC Integration Plan for Next.js Pages Router

## Overview
This plan outlines the complete integration of tRPC into a Next.js pages router project with TypeScript. The implementation follows 2025 best practices and official tRPC documentation for maximum type safety and developer experience.

## Required Dependencies

### Core Dependencies
```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod
```

### Versions
- `@trpc/server@next` - tRPC server-side utilities
- `@trpc/client@next` - tRPC client-side utilities  
- `@trpc/react-query@next` - React Query integration for tRPC
- `@trpc/next@next` - Next.js specific helpers
- `@tanstack/react-query@latest` - React Query for data fetching
- `zod` - Runtime type validation

## Folder Structure

Based on 2025 best practices and official tRPC documentation:

```
src/
├── pages/
│   ├── _app.tsx              # App component with tRPC provider
│   ├── index.tsx             # Homepage using tRPC procedures
│   └── api/
│       └── trpc/
│           └── [trpc].ts     # tRPC API handler
├── server/
│   ├── trpc.ts               # Base tRPC configuration
│   ├── context.ts            # tRPC context creation
│   └── routers/
│       ├── _app.ts           # Main app router
│       └── greeting.ts       # Example greeting sub-router
└── utils/
    └── trpc.ts               # tRPC client configuration and hooks
```

### Folder Structure Explanations

#### `/src/server/`
Contains all server-side tRPC code:
- **`trpc.ts`**: Base tRPC instance with procedures and middleware
- **`context.ts`**: Context creation function for request/response handling
- **`routers/`**: All tRPC routers organized by feature/domain

#### `/src/utils/`
Client-side utilities:
- **`trpc.ts`**: Type-safe hooks and client configuration

#### `/src/pages/api/trpc/`
Next.js API routes:
- **`[trpc].ts`**: Catch-all API handler for tRPC requests

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install @trpc/server @trpc/client @trpc/react-query @trpc/next @tanstack/react-query zod
```

### Step 2: Create Base tRPC Configuration

**File: `src/server/trpc.ts`**
```typescript
import { initTRPC } from '@trpc/server';
import { Context } from './context';

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const procedure = t.procedure;
```

### Step 3: Set Up tRPC Context

**File: `src/server/context.ts`**
```typescript
import { CreateNextContextOptions } from '@trpc/server/adapters/next';

export function createContext(opts: CreateNextContextOptions) {
  return {
    req: opts.req,
    res: opts.res,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
```

### Step 4: Create Example Router

**File: `src/server/routers/greeting.ts`**
```typescript
import { z } from 'zod';
import { router, procedure } from '../trpc';

export const greetingRouter = router({
  hello: procedure
    .input(z.object({ name: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name}!`,
        timestamp: new Date().toISOString(),
      };
    }),
  
  sayGoodbye: procedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      return {
        message: `Goodbye ${input.name}!`,
        timestamp: new Date().toISOString(),
      };
    }),
});
```

### Step 5: Create Main App Router

**File: `src/server/routers/_app.ts`**
```typescript
import { router } from '../trpc';
import { greetingRouter } from './greeting';

export const appRouter = router({
  greeting: greetingRouter,
});

export type AppRouter = typeof appRouter;
```

### Step 6: Set Up API Handler

**File: `src/pages/api/trpc/[trpc].ts`**
```typescript
import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';
import { createContext } from '../../../server/context';

export default createNextApiHandler({
  router: appRouter,
  createContext,
  onError:
    process.env.NODE_ENV === 'development'
      ? ({ path, error }) => {
          console.error(
            `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
          );
        }
      : undefined,
});
```

### Step 7: Configure tRPC Client

**File: `src/utils/trpc.ts`**
```typescript
import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../server/routers/_app';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
        }),
      ],
    };
  },
  ssr: false,
});
```

### Step 8: Update App Component

**File: `src/pages/_app.tsx`**
```typescript
import type { AppType } from 'next/app';
import { trpc } from '../utils/trpc';

const MyApp: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default trpc.withTRPC(MyApp);
```

### Step 9: Update Homepage

**File: `src/pages/index.tsx`**
```typescript
import { trpc } from '../utils/trpc';

export default function Home() {
  const hello = trpc.greeting.hello.useQuery({ name: 'World' });
  const sayGoodbyeMutation = trpc.greeting.sayGoodbye.useMutation();

  const handleSayGoodbye = () => {
    sayGoodbyeMutation.mutate({ name: 'World' });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>tRPC Integration Demo</h1>
      
      <div style={{ marginBottom: '1rem' }}>
        <h2>Query Example:</h2>
        {hello.data ? (
          <div>
            <p><strong>Greeting:</strong> {hello.data.greeting}</p>
            <p><strong>Timestamp:</strong> {hello.data.timestamp}</p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div>
        <h2>Mutation Example:</h2>
        <button onClick={handleSayGoodbye} disabled={sayGoodbyeMutation.isLoading}>
          Say Goodbye
        </button>
        {sayGoodbyeMutation.data && (
          <div style={{ marginTop: '0.5rem' }}>
            <p><strong>Message:</strong> {sayGoodbyeMutation.data.message}</p>
            <p><strong>Timestamp:</strong> {sayGoodbyeMutation.data.timestamp}</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Configuration Requirements

### TypeScript Configuration
Ensure `tsconfig.json` has strict mode enabled:
```json
{
  "compilerOptions": {
    "strict": true,
    // ... other options
  }
}
```

### Environment Variables (Optional)
For production deployments:
```env
VERCEL_URL=your-deployment-url.vercel.app
```

## Key Features Implemented

### 1. Type Safety
- End-to-end TypeScript types from server to client
- Input validation with Zod schemas
- Automatic type inference for procedures

### 2. Developer Experience
- Hot reloading for both client and server changes
- Error handling with detailed development messages
- Batch requests for optimal performance

### 3. Example Procedures
- **Query**: `greeting.hello` - demonstrates data fetching
- **Mutation**: `greeting.sayGoodbye` - demonstrates data modification

### 4. Best Practices
- Feature-based router organization
- Proper context handling
- Environment-aware base URL configuration
- Error boundary setup

## Testing the Integration

### Manual Testing
1. Start the development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Verify the greeting message appears
4. Click "Say Goodbye" button to test mutation
5. Check browser network tab for tRPC requests

### Expected Behavior
- Homepage loads with "Hello World!" greeting
- Timestamp shows current time
- Goodbye button triggers mutation and displays result
- All requests go to `/api/trpc` endpoint
- Type safety prevents runtime errors

## Scalability Considerations

### Adding New Routers
1. Create new router file in `src/server/routers/`
2. Import and add to main app router
3. Types are automatically inferred

### Advanced Features
- Authentication middleware
- Database integration
- Real-time subscriptions
- Input/output transformers
- Custom error handling

This implementation provides a solid foundation for a type-safe, scalable tRPC integration that follows current best practices and can grow with your application's needs.