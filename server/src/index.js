require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase, checkDatabaseConnection } = require('./db');

// Import routes
const storeRoutes = require('./routes/stores');
const productRoutes = require('./routes/products');
const chatRoutes = require('./routes/chat');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3001;

// =====================
// Middleware
// =====================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// =====================
// Health Check
// =====================
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Shopping Mall API',
    supabase: process.env.SUPABASE_URL || 'not configured',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
  });
});

// =====================
// API Routes
// =====================
app.use('/api/stores', storeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);

// =====================
// Error Handling
// =====================
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// =====================
// Start Server
// =====================
async function startServer() {
  try {
    // 1. Verify Supabase PostgreSQL connection
    if (process.env.DATABASE_URL) {
      const connected = await checkDatabaseConnection();
      if (!connected) {
        console.error('❌ Cannot connect to Supabase. Check DATABASE_URL in server/.env');
        process.exit(1);
      }
      // 2. Run schema migrations + seed data
      await initializeDatabase();
    } else {
      console.warn('⚠️  DATABASE_URL not set. Skipping Supabase DB initialization.');
    }

    // 3. Warn if Supabase JS client env vars are missing
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️  SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Supabase JS client unavailable.');
    } else {
      console.log(`✅ Supabase JS client initialised → ${process.env.SUPABASE_URL}`);
    }

    app.listen(PORT, () => {
      console.log(`\n🚀 AI Shopping Mall API running at http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`☁️  Supabase project: ${process.env.SUPABASE_URL || 'not configured'}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

