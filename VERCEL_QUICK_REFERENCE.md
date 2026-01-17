# Vercel Deployment - Quick Reference

## Files Changed

### 1. ✅ `src/main.ts`

**Status**: Updated for Vercel serverless

```typescript
✓ Uses ExpressAdapter from @nestjs/platform-express
✓ No app.listen() call
✓ Exports expressApp and createNestApp()
✓ app.init() only (doesn't start server)
```

### 2. ✅ `api/index.ts`

**Status**: Vercel entry point configured

```typescript
✓ Default export handler: (req, res) => Promise
✓ Singleton pattern for warm starts
✓ NestJS app cached across requests
✓ Proper error handling with response checks
```

### 3. ✅ `vercel.json`

**Status**: Configured for serverless

```json
✓ Builds api/index.ts with @vercel/node
✓ Routes all requests to /api/index.ts
✓ CORS headers enabled for all origins
✓ buildCommand: "npm run build" configured
```

### 4. ✅ `src/setup.ts`

**Status**: CORS already enabled

```typescript
✓ app.enableCors({ origin: '*' })
✓ All HTTP methods allowed
✓ Comprehensive allowed headers
```

### 5. ✅ `package.json`

**Status**: Dependencies already present

```json
✓ @nestjs/core: ^11.1.11
✓ @nestjs/platform-express: ^11.1.11
✓ express: ^4.18.2
✓ No additional packages needed
```

---

## Why `app.listen()` Is Removed

| Aspect                  | Traditional Server           | Vercel Serverless              |
| ----------------------- | ---------------------------- | ------------------------------ |
| **Process Lifecycle**   | Long-lived (keeps running)   | Ephemeral (dies after request) |
| **Port Binding**        | You manage the port          | Vercel manages ports           |
| **HTTP Server**         | Created by your code         | Provided by Vercel             |
| **Request Handling**    | Accepts multiple connections | Handles one request at a time  |
| **`app.listen()` Call** | ✅ Required                  | ❌ Would timeout/fail          |
| **`app.init()` Call**   | Not needed                   | ✅ Required                    |

**Result**: When you call `app.listen()` on Vercel, the function hangs waiting for a server that never properly starts in the serverless environment.

---

## Deployment Checklist

- [ ] Run `npm run build` locally to verify compilation
- [ ] Check that `dist/` folder exists with JavaScript files
- [ ] Ensure `.env` has database credentials
- [ ] Push code to GitHub (or connect to Vercel directly)
- [ ] Go to [vercel.com](https://vercel.com) and import project
- [ ] Add environment variables in Vercel Dashboard:
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_NAME`
  - `NODE_ENV=production`
- [ ] Deploy (Vercel automatically detects `vercel.json`)
- [ ] Test API endpoints on `https://your-project.vercel.app/api/...`
- [ ] Monitor cold start times in Vercel Analytics

---

## Performance Metrics to Monitor

After deployment, check these in Vercel Dashboard:

1. **Cold Start Duration**: First request after deploy (~1-3 seconds)
2. **Warm Start Duration**: Subsequent requests (~50-200ms)
3. **Function Duration**: How long requests take to process
4. **Memory Usage**: Make sure stays under limit
5. **Error Rate**: Monitor for 5xx errors

---

## Common Issues & Solutions

### Issue: `Cannot find module '@nestjs/core'`

**Solution**: Run `npm install` and rebuild: `npm run build`

### Issue: CORS errors from frontend

**Solution**: Verify `vercel.json` headers and `setup.ts` CORS config match

### Issue: Database connection timeouts

**Solution**:

- Ensure DB credentials in environment variables
- Check database firewall allows Vercel IPs
- Consider using managed database (PlanetScale, Neon)

### Issue: 504 Timeout on first request

**Solution**: This is normal cold start. Check logs in Vercel Dashboard.

---

## Next Steps for Production

### 1. **Optimize Cold Start**

- Monitor cold start metrics
- Consider serverless-optimized database (PlanetScale)
- Lazy-load heavy modules if needed

### 2. **Set Up Monitoring**

- Enable Vercel Analytics
- Add error tracking (e.g., Sentry)
- Monitor database connection pool

### 3. **Configure Custom Domain**

- Add domain in Vercel Settings
- Point DNS records to Vercel nameservers

### 4. **Set Up CI/CD**

- GitHub actions auto-deploy on push
- Vercel preview deployments for PRs
- Automatic rollbacks on failures

---

## For More Information

- [Vercel NestJS Docs](https://vercel.com/docs)
- [NestJS Deploying](https://docs.nestjs.com/deployment)
- [ExpressAdapter Guide](https://docs.nestjs.com/techniques/http-adapter)
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Full detailed guide
