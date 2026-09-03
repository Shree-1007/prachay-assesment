import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import voucherRoutes from './routes/voucherRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);

import { initDb } from './config/db';

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Expense Voucher API is running' });
});

// Start server
const start = async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start();
