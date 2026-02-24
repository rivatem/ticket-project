import { Router } from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Admin Middleware
const adminAuth = (req: any, res: any, next: any) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get Admin Stats
router.get('/stats', adminAuth, (req, res) => {
  try {
    const totalRevenue = db.prepare('SELECT SUM(totalAmount) as total FROM orders WHERE paymentStatus = "completed"').get() as any;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const activeEvents = db.prepare('SELECT COUNT(*) as count FROM events WHERE status = "published"').get() as any;
    const totalTickets = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as any;

    res.json({
      totalRevenue: totalRevenue?.total || 0,
      totalUsers: totalUsers?.count || 0,
      activeEvents: activeEvents?.count || 0,
      totalTickets: totalTickets?.count || 0
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Users
router.get('/users', adminAuth, (req, res) => {
  try {
    const users = db.prepare('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC').all();
    res.json(users);
  } catch (error: any) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Events with Revenue
router.get('/events', adminAuth, (req, res) => {
  try {
    const events = db.prepare(`
      SELECT e.*, 
             (SELECT SUM(o.totalAmount) FROM orders o WHERE o.eventId = e.id AND o.paymentStatus = "completed") as revenue,
             (SELECT COUNT(*) FROM tickets t WHERE t.eventId = e.id) as ticketsSold
      FROM events e
      ORDER BY e.createdAt DESC
    `).all();
    res.json(events);
  } catch (error: any) {
    console.error('Admin events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Recent Transactions
router.get('/transactions', adminAuth, (req, res) => {
  try {
    const transactions = db.prepare(`
      SELECT o.*, u.name as userName, e.title as eventTitle
      FROM orders o
      JOIN users u ON o.userId = u.id
      JOIN events e ON o.eventId = e.id
      ORDER BY o.createdAt DESC
      LIMIT 50
    `).all();
    res.json(transactions);
  } catch (error: any) {
    console.error('Admin transactions error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
