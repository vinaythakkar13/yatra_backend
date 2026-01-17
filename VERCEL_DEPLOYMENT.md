# Vercel Deployment Guide for NestJS Backend

This guide will help you deploy your NestJS backend application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you don't have one
2. **Git Repository**: Your code should be pushed to GitHub, GitLab, or Bitbucket
3. **Vercel CLI** (optional, for local testing): Install with `npm i -g vercel` (version ≥ 48.4.0)

## Project Structure

The project has been configured for Vercel deployment with:

- **`api/index.ts`**: Serverless entry point that wraps your NestJS application
- **`vercel.json`**: Vercel configuration file specifying build and routing settings
- **`src/main.ts`**: Original NestJS bootstrap file (for local development)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to Git**
   ```bash
   git add .
   git commit -m "Add Vercel deployment configuration"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel will auto-detect it as a Node.js/NestJS project

3. **Configure Environment Variables**
   In the Vercel dashboard, add all required environment variables:
   
   **Database Configuration:**
   ```
   DB_HOST=your_database_host
   DB_PORT=3306
   DB_NAME=your_database_name
   DB_USER=your_database_user
   DB_PASSWORD=your_database_password
   DB_DIALECT=mysql
   ```
   
   **Server Configuration:**
   ```
   PORT=5000
   NODE_ENV=production
   ```
   
   **JWT Configuration:**
   ```
   JWT_SECRET=your_secure_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ```
   
   **CORS Configuration:**
   ```
   CORS_ORIGIN=https://yourfrontend.com,https://app.yourfrontend.com
   ```
   
   **Admin Credentials:**
   ```
   DEFAULT_ADMIN_EMAIL=admin@yatra.com
   DEFAULT_ADMIN_PASSWORD=your_secure_password
   ```
   
   **Cloudinary Configuration:**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
   
   **Optional (for Swagger in production):**
   ```
   ENABLE_SWAGGER=true
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Wait for the deployment to complete

5. **Access Your API**
   - Your API will be available at: `https://your-project.vercel.app/api`
   - Swagger docs (if enabled): `https://your-project.vercel.app/api-docs`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI** (if not already installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Test locally** (optional)
   ```bash
   vercel dev
   ```
   This will start a local development server that simulates Vercel's environment.

4. **Deploy to Preview**
   ```bash
   vercel
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Configuration Details

### vercel.json

The `vercel.json` file configures:

- **Build**: Uses `@vercel/node` runtime for the serverless function
- **Routes**: All requests are routed to `api/index.ts`
- **Function Settings**: 
  - Max duration: 30 seconds
  - Memory: 1024 MB

### Serverless Entry Point (api/index.ts)

The serverless entry point:

- Initializes the NestJS application once and caches it for reuse
- Configures CORS, validation, and Swagger
- Exports a handler function that Vercel calls for each request
- Handles all HTTP methods (GET, POST, PUT, PATCH, DELETE, OPTIONS)

## Important Considerations

### 1. Database Connection

- **Use a managed database service** (e.g., PlanetScale, AWS RDS, Google Cloud SQL)
- Ensure your database allows connections from Vercel's IP ranges
- Consider using connection pooling for better performance

### 2. Environment Variables

- **Never commit `.env` files** to Git
- Add all environment variables in the Vercel dashboard
- Use Vercel's environment variable management for different environments (Production, Preview, Development)

### 3. Cold Starts

- Serverless functions may experience cold starts on first request
- The app instance is cached to minimize cold start impact
- Consider using Vercel Pro plan for better performance

### 4. File Size Limits

- Vercel Functions have a **250 MB size limit**
- Ensure your `node_modules` and build output don't exceed this limit
- Use `.vercelignore` to exclude unnecessary files

### 5. CORS Configuration

- Update `CORS_ORIGIN` environment variable with your frontend URLs
- Use comma-separated values for multiple origins
- Never use `*` in production

### 6. Swagger Documentation

- Swagger is disabled by default in production
- Set `ENABLE_SWAGGER=true` if you want to enable it in production
- Access at: `https://your-project.vercel.app/api-docs`

## Troubleshooting

### Build Failures

1. **Check build logs** in Vercel dashboard
2. **Verify TypeScript compilation**: Run `npm run build` locally
3. **Check dependencies**: Ensure all dependencies are in `package.json`

### Runtime Errors

1. **Check function logs** in Vercel dashboard
2. **Verify environment variables** are set correctly
3. **Check database connectivity** from Vercel's network

### CORS Issues

1. **Verify CORS_ORIGIN** environment variable is set correctly
2. **Check allowed methods** include OPTIONS
3. **Ensure credentials** are configured if needed

### Database Connection Issues

1. **Verify database credentials** are correct
2. **Check database firewall** allows Vercel IPs
3. **Test connection** from a different network
4. **Consider using SSL** for database connections

## Local Development

For local development, continue using:

```bash
npm run dev
```

This uses the original `src/main.ts` file and runs a traditional Node.js server.

## Monitoring

- **Vercel Dashboard**: Monitor deployments, logs, and analytics
- **Function Logs**: View real-time logs in the Vercel dashboard
- **Analytics**: Track API usage and performance metrics

## Additional Resources

- [Vercel NestJS Documentation](https://vercel.com/docs/frameworks/backend/nestjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Function Configuration](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)

## Support

If you encounter issues:

1. Check Vercel's [documentation](https://vercel.com/docs)
2. Review [Vercel's community forum](https://github.com/vercel/vercel/discussions)
3. Check your deployment logs in the Vercel dashboard
