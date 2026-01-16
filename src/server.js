require('dotenv').config();

// Register TypeScript support for requiring .ts files
try {
  require('ts-node').register({
    transpileOnly: true,
    compilerOptions: {
      module: 'commonjs',
      esModuleInterop: true,
      allowSyntheticDefaultImports: true
    }
  });
} catch (e) {
  // ts-node not available, will handle TypeScript files differently
  console.warn('⚠️  ts-node not available. TypeScript routes may not work.');
}

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const { sequelize } = require('./models');
const swaggerSpec = require('./config/swagger');
const { corsOptions, logCorsConfig, corsErrorHandler } = require('./config/cors');

const app = express();
const PORT = process.env.PORT || 5000;


// Apply CORS configuration BEFORE routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight

// Body parsing with increased limit for base64 image uploads
// Base64 images can be large, so we set a 20MB limit (default is 100kb)
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Logging
app.use(morgan('dev'));

// Client IP logger
app.get('/ip', (req, res) => {
  console.log('IP address:', req.ip);
  res.json({ ip: req.ip });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Yatra API Documentation'
}));

app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Yatra Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Info Route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Yatra Event Management System API',
    version: '1.0.0'
  });
});

// Routes
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const userRoutes = require('./routes/users');
const yatraRoutes = require('./routes/yatra');

// Cloudinary routes (TypeScript)
let cloudinaryRoutes;
try {
  const cloudinaryModule = require('./routes/cloudinary.routes');
  // Handle ES6 default export (TypeScript exports default as .default)
  cloudinaryRoutes = cloudinaryModule.default || cloudinaryModule;
} catch (e) {
  console.warn('⚠️  Cloudinary routes not loaded:', e.message);
}

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/users', userRoutes);
app.use('/api/yatra', yatraRoutes);

if (cloudinaryRoutes) {
  app.use('/api/cloudinary', cloudinaryRoutes);
}

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// CORS Error Handler
app.use(corsErrorHandler);

// General Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start Server
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running at http://localhost:${PORT}`);
      logCorsConfig();
    });
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
