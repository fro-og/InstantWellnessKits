import express from 'express';
import pool from './config/database';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import ordersRoutes from './routes/orders.routes';
import { testConnection } from './config/database';
import { RowDataPacket } from 'mysql2';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

app.use('/api/orders', ordersRoutes);

app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: dbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV
  });
});

// test endpoint for orders
app.get('/api/test-orders', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders LIMIT 5');
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error('Test query error:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// test endpoint for count
app.get('/api/test-count', async (req, res) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT COUNT(*) as count FROM orders');
    res.json({ success: true, count: rows[0].count });
  } catch (error) {
    console.error('Test count error:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// start server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
  console.log(`Database: ${process.env.DB_NAME} on ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  testConnection();
});