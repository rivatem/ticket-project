import { Router } from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

// Middleware to protect routes
const auth = (req: any, res: any, next: any) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Get all events (public)
router.get('/', (req, res) => {
  const { category, city, search } = req.query;
  let query = 'SELECT * FROM events WHERE status = "published"';
  const params: any[] = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (city) {
    query += ' AND city = ?';
    params.push(city);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY startDate ASC';
  try {
    const events = db.prepare(query).all(...params);
    res.json(events);
  } catch (error: any) {
    console.error('Fetch events error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single event with ticket types
router.get('/:id', (req, res) => {
  try {
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ticketTypes = db.prepare('SELECT * FROM ticket_types WHERE eventId = ? AND isActive = 1').all(req.params.id);
    res.json({ ...event, ticketTypes });
  } catch (error: any) {
    console.error('Fetch event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create event (organizer)
router.post('/', auth, (req: any, res) => {
  const { title, description, category, bannerImage, startDate, endDate, venue, address, city, ticketTypes } = req.body;

  try {
    const insertEvent = db.prepare(`
      INSERT INTO events (title, description, category, bannerImage, startDate, endDate, venue, address, city, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertEvent.run(title, description, category, bannerImage, startDate, endDate, venue, address, city, req.user.id);
    const eventId = Number(result.lastInsertRowid);

    if (ticketTypes && Array.isArray(ticketTypes)) {
      const insertTicketType = db.prepare(`
        INSERT INTO ticket_types (eventId, name, price, quantity, description)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const tt of ticketTypes) {
        insertTicketType.run(eventId, tt.name, tt.price, tt.quantity, tt.description);
      }
    }

    res.status(201).json({ id: eventId, message: 'Event created successfully' });
  } catch (error: any) {
    console.error('Create event error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
