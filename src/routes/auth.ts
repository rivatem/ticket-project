import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  try {
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = db.prepare(
      'INSERT INTO users (name, email, password, phoneNumber) VALUES (?, ?, ?, ?)'
    ).run(name, email, hashedPassword, phoneNumber);

    const user = { id: Number(result.lastInsertRowid), name, email, phoneNumber, role: 'user' };
    const token = jwt.sign({ id: Number(user.id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({ user, token });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Special Admin Login
    if (email === 'ADMIN254' && password === 'kingori') {
      let admin = db.prepare('SELECT * FROM users WHERE email = ?').get('ADMIN254') as any;
      
      if (!admin) {
        // Create the admin user if it doesn't exist
        const hashedPassword = await bcrypt.hash('kingori', 10);
        const result = db.prepare(
          'INSERT INTO users (name, email, password, phoneNumber, role) VALUES (?, ?, ?, ?, ?)'
        ).run('System Admin', 'ADMIN254', hashedPassword, '0000000000', 'admin');
        admin = { id: Number(result.lastInsertRowid), name: 'System Admin', email: 'ADMIN254', role: 'admin' };
      }

      const token = jwt.sign({ id: Number(admin.id), role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });
      return res.json({ user: admin, token });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: Number(user.id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// Get Current User
router.get('/me', (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = db.prepare('SELECT id, name, email, phoneNumber, role FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error: any) {
    console.error('Auth me error:', error);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
});

export default router;
