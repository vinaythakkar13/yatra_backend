const envOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : [];

const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://localhost:3001',
  'https://procambial-lochlan-sarcophagous.ngrok-free.dev',
  ...envOrigins
];

// Remove duplicates and empty strings
const uniqueOrigins = [...new Set(allowedOrigins.filter(Boolean))];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || uniqueOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked origin: ${origin}`);
      callback(new Error(`CORS error: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'content-type',
    'Authorization',
    'authorization',
    'X-Requested-With',
    'Accept',
    'accept',
    'Origin',
    'origin',
    'x-client-version',
    'x-client-platform',
    'X-Client-Version',
    'X-Client-Platform',
    'Referer',
    'referer',
    'User-Agent',
    'user-agent',
    'sec-ch-ua',
    'sec-ch-ua-mobile',
    'sec-ch-ua-platform',
    'sec-fetch-dest',
    'sec-fetch-mode',
    'sec-fetch-site',
    'sec-fetch-user',
    'Accept-Language',
    'Accept-Encoding',
  ]
};

const logCorsConfig = () => {
  console.log('\n🛡 Effective CORS Allowed Origins:');
  uniqueOrigins.forEach(o => console.log(`  ✔ ${o}`));
};

const corsErrorHandler = (err, req, res, next) => {
  if (err.message?.startsWith('CORS error')) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }
  console.log(err, "err");
  next(err);
};

module.exports = { corsOptions, logCorsConfig, corsErrorHandler };
