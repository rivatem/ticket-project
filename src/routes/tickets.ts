import { Router } from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

const auth = (req: any, res: any, next: any) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Create Order & Initiate Payment (Simulation)
router.post('/create', auth, async (req: any, res) => {
  const { eventId, ticketTypeId, quantity, phoneNumber, attendees } = req.body;

  try {
    const ticketType = db.prepare('SELECT * FROM ticket_types WHERE id = ?').get(ticketTypeId) as any;
    if (!ticketType || ticketType.eventId !== eventId) {
      return res.status(400).json({ message: 'Invalid ticket type' });
    }

    if (ticketType.sold + quantity > ticketType.quantity) {
      return res.status(400).json({ message: 'Not enough tickets available' });
    }

    const totalAmount = ticketType.price * quantity;
    const orderNumber = `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const result = db.prepare(`
      INSERT INTO orders (orderNumber, userId, eventId, ticketTypeId, quantity, totalAmount, phoneNumber, paymentStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `).run(orderNumber, req.user.id, eventId, ticketTypeId, quantity, totalAmount, phoneNumber);

    const orderId = Number(result.lastInsertRowid);

    // SIMULATION: In a real app, we'd call M-Pesa STK Push here.
    // For this demo, we'll auto-approve after 2 seconds.
    setTimeout(async () => {
      db.prepare("UPDATE orders SET paymentStatus = 'completed', mpesaReceiptNumber = ? WHERE id = ?")
        .run(`SIM-${uuidv4().slice(0, 8).toUpperCase()}`, orderId);

      // Generate Tickets
      for (let i = 0; i < quantity; i++) {
        const attendee = attendees[i] || { name: 'Attendee', email: '' };
        const ticketNumber = `TIX-${uuidv4().slice(0, 8).toUpperCase()}`;
        
        // Generate QR Code
        const qrData = JSON.stringify({
          t: ticketNumber,
          e: eventId,
          o: orderId
        });
        const qrCodeDataUrl = await QRCode.toDataURL(qrData);

        db.prepare(`
          INSERT INTO tickets (ticketNumber, orderId, eventId, userId, attendeeName, attendeeEmail, ticketType, price, qrCode)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(ticketNumber, orderId, eventId, req.user.id, attendee.name, attendee.email, ticketType.name, ticketType.price, qrCodeDataUrl);
      }

      // Update sold count
      db.prepare('UPDATE ticket_types SET sold = sold + ? WHERE id = ?').run(quantity, ticketTypeId);
    }, 2000);

    res.json({ orderId, orderNumber, message: 'Payment initiated. Please check your phone.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get order status
router.get('/:id/status', auth, (req, res) => {
  try {
    const order = db.prepare('SELECT paymentStatus FROM orders WHERE id = ?').get(req.params.id) as any;
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ status: order.paymentStatus });
  } catch (error: any) {
    console.error('Order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user tickets
router.get('/my-tickets', auth, (req: any, res) => {
  try {
    const tickets = db.prepare(`
      SELECT t.*, e.title as eventTitle, e.startDate, e.venue, e.bannerImage
      FROM tickets t
      JOIN events e ON t.eventId = e.id
      WHERE t.userId = ?
      ORDER BY t.createdAt DESC
    `).all(req.user.id);
    res.json(tickets);
  } catch (error: any) {
    console.error('My tickets error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
