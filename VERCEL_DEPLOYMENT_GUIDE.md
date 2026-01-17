# Vercel Deployment Guide for NestJS Application

## Overview

Your NestJS application has been refactored to work with Vercel's serverless @vercel/node runtime. This guide explains the architecture and why these changes are necessary.

---

## Key Changes Made

### 1. **Updated `src/main.ts`** - Express Adapter Implementation

#### What Changed:

- ✅ Renamed `server` to `expressApp` for clarity
- ✅ Enhanced documentation with detailed comments
- ✅ Removed any `app.listen()` calls
- ✅ Clean separation between app creation and request handling

#### Why This Matters:

```typescript
// ❌ BEFORE (Would block Vercel):
const app = await NestFactory.create(AppModule);
await app.listen(3000); // Blocks serverless runtime

// ✅ AFTER (Vercel-compatible):
const app = await NestFactory.create(
  AppModule,
  new ExpressAdapter(expressInstance),
);
await app.init(); // Only initializes, doesn't listen
```

**Key Point**: Vercel's serverless functions cannot call `app.listen()` because:

- Vercel manages the HTTP server lifecycle, not your code
- Each function invocation is stateless
- Calling `listen()` would either hang or timeout the function
- The runtime expects your code to handle individual requests, not manage a server

---

### 2. **Updated `api/index.ts`** - Vercel Serverless Handler

#### What This File Does:

- Serves as the entry point for **all HTTP requests** on Vercel
- Implements singleton pattern for NestJS app initialization
- Handles cold starts and warm starts efficiently

#### Code Flow:

```
Request from Vercel
        ↓
api/index.ts handler invoked
        ↓
Check if NestJS app already initialized?
        ↓
    NO (cold start)          YES (warm start)
      ↓                          ↓
  Initialize          Reuse cached instance
  (slow, once)        (fast, cached)
      ↓                          ↓
      └──────────┬───────────────┘
                 ↓
         Route request through Express
                 ↓
        Response sent back to client
```

#### Singleton Pattern Benefits:

```typescript
let nestAppPromise: Promise<any> | null = null;

if (!nestAppPromise) {
  // Cold start: Initialize once
  nestAppPromise = createNestApp(expressApp);
}

// Warm start: Reuse cached promise
await nestAppPromise;
```

This pattern is crucial because:

- **Cold Start**: First request initializes NestJS (~1-3 seconds)
- **Warm Start**: Subsequent requests reuse the cached instance (~50-100ms)
- Serverless containers are kept alive for short periods, so warm starts happen frequently

---

### 3. **Updated `vercel.json`** - Deployment Configuration

#### Key Sections Explained:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  // ↑ Runs `tsc` to compile TypeScript to JavaScript

  "builds": [
    {
      "src": "api/index.ts", // Entry file
      "use": "@vercel/node" // Node.js runtime
    }
  ],

  "routes": [
    {
      "src": "/(.*)", // All requests
      "dest": "/api/index.ts" // Route to handler
    }
  ],

  "headers": [
    // CORS headers - automatically applied to all responses
    {
      "key": "Access-Control-Allow-Origin",
      "value": "*" // Accept requests from any origin
    }
  ]
}
```

#### What Each Setting Does:

| Setting        | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `buildCommand` | Compiles TypeScript to JavaScript before deployment |
| `api/index.ts` | The Vercel handler function entry point             |
| `@vercel/node` | Node.js runtime (not bundled/static)                |
| `routes`       | Maps all incoming requests to your handler          |
| `CORS headers` | Enables cross-origin requests from frontend apps    |

---

### 4. **CORS Configuration** - Already Enabled

Your `src/setup.ts` already has comprehensive CORS setup:

```typescript
app.enableCors({
  origin: "*", // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    /* comprehensive list */
  ],
  credentials: true,
});
```

This is reinforced by the CORS headers in `vercel.json`, providing defense-in-depth.

---

### 5. **Package Dependencies** - No Changes Needed ✅

All required dependencies are already present:

```json
{
  "@nestjs/core": "^11.1.11",
  "@nestjs/platform-express": "^11.1.11",
  "express": "^4.18.2",
  "cors": "^2.8.5"
}
```

No additional packages needed for Vercel deployment.

---

## Deployment Steps

### 1. **Build Locally to Test**

```bash
npm run build
# or
npm run vercel-build
```

Verify the `dist/` folder is created with compiled JavaScript.

### 2. **Deploy to Vercel**

#### Option A: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

#### Option B: Via GitHub Integration

1. Push code to GitHub
2. Connect repo on [vercel.com](https://vercel.com)
3. Vercel automatically deploys on push

#### Option C: Via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your repository

### 3. **Configure Environment Variables**

In Vercel Dashboard → Settings → Environment Variables, add:

```
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-username
DB_PASSWORD=your-password
DB_NAME=your-database
NODE_ENV=production
```

---

## Production Optimization Tips

### 1. **Database Connection Pooling**

Your `app.module.ts` already has connection pooling:

```typescript
connectionLimit: nodeEnv === "production" ? 10 : 5;
```

For serverless, consider using connection pooling services:

- **PlanetScale** (MySQL compatible)
- **Neon** (PostgreSQL)
- **Supabase** (PostgreSQL)

### 2. **Cold Start Optimization**

- NestJS initialization is cached (singleton pattern handles this)
- Consider lazy-loading modules for improved startup time
- Monitor cold start times in Vercel Analytics

### 3. **Function Duration Limits**

- Free tier: 10 seconds per request
- Pro tier: 60 seconds per request

Long-running tasks should use async jobs or queues.

### 4. **Logging**

Your logger is already optimized:

```typescript
logger: ["error", "warn", "log"];
```

Vercel automatically captures console logs. Access them in Vercel Dashboard → Deployments → Logs.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│  Client (Frontend)                                      │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP Request
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Vercel Edge Network                                    │
│  (Distributed globally, handles routing)                │
└────────────────────────┬────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Vercel Serverless Function (api/index.ts)             │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Singleton App Initialization Cache             │   │
│  │  (NestJS app created once, reused many times)   │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     ↓                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ExpressAdapter(expressApp)                     │   │
│  │  ├─ CORS middleware                             │   │
│  │  ├─ Body parser (20MB limit)                    │   │
│  │  ├─ Validation pipe                             │   │
│  │  └─ NestJS routing logic                        │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     ↓                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Your Application Modules                       │   │
│  │  ├─ AuthModule                                  │   │
│  │  ├─ HotelsModule                                │   │
│  │  ├─ UsersModule                                 │   │
│  │  ├─ YatraModule                                 │   │
│  │  └─ RegistrationsModule                         │   │
│  └──────────────────┬──────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP Response
                     ↓
┌─────────────────────────────────────────────────────────┐
│  Database (MySQL/MariaDB)                               │
└─────────────────────────────────────────────────────────┘
```

---

## Why `app.listen()` Must Be Removed

### The Problem:

When you call `app.listen(port)`, you're telling the application to:

1. Create an HTTP server
2. Bind to a port
3. Keep the server running indefinitely

### In a Traditional Server:

```
Server boots → Listens on port 3000 → Waits for requests → Handles requests indefinitely
```

### In Vercel Serverless:

```
Request arrives → Function invoked → Must respond within 60s → Function terminated
```

If you call `app.listen()`, the Vercel function would:

1. Start the listen process
2. Timeout waiting for the server to start
3. Kill the process

### The Solution:

Use `app.init()` instead:

```typescript
await app.init(); // ✅ Initializes all middleware and routes
// Don't call: await app.listen(3000); ❌
```

The Express instance is already provided, so NestJS just attaches itself and returns control to the handler.

---

## Testing Locally

### Test with Vercel CLI:

```bash
npm install -g vercel
vercel dev
```

This simulates the Vercel serverless environment locally.

### Test with Manual Build:

```bash
npm run build
npm run start  # This should fail if app.listen() is present
```

The application should not hang or fail during startup.

---

## Troubleshooting

| Issue                              | Cause                             | Solution                                       |
| ---------------------------------- | --------------------------------- | ---------------------------------------------- |
| **Timeout (504)**                  | Cold start taking too long        | Add monitoring, optimize heavy imports         |
| **"app.listen is not a function"** | Trying to call listen() on NestJS | Use only `app.init()` in main.ts               |
| **CORS errors**                    | Wrong origin in headers           | Verify CORS config in setup.ts and vercel.json |
| **Database connection errors**     | Connection pool exhausted         | Use connection pooling service (PlanetScale)   |
| **500 errors on first request**    | Cold start not caching NestJS     | Check that `nestAppPromise` singleton works    |

---

## Summary

✅ **What's Done:**

- `src/main.ts`: Uses ExpressAdapter, exports handler, no `app.listen()`
- `api/index.ts`: Vercel entry point with singleton pattern
- `vercel.json`: Configured for optimal serverless deployment
- `CORS`: Enabled for all origins
- `package.json`: All dependencies already present

✅ **Ready to Deploy:**

1. Run `npm run build` to verify compilation
2. Push to GitHub or deploy via Vercel CLI
3. Set environment variables in Vercel Dashboard
4. Monitor logs and cold start metrics

Your application is now **production-ready for Vercel serverless deployment**! 🚀
