import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('eventtix.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize tables
export function initDb() {
  try {
    // Users Table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phoneNumber TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

  // Events Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      bannerImage TEXT,
      startDate DATETIME NOT NULL,
      endDate DATETIME NOT NULL,
      venue TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      createdBy INTEGER NOT NULL,
      status TEXT DEFAULT 'published',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (createdBy) REFERENCES users(id)
    )
  `);

  // Ticket Types Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ticket_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      eventId INTEGER NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      sold INTEGER DEFAULT 0,
      description TEXT,
      maxPerOrder INTEGER DEFAULT 10,
      isActive INTEGER DEFAULT 1,
      FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE
    )
  `);

  // Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderNumber TEXT UNIQUE NOT NULL,
      userId INTEGER NOT NULL,
      eventId INTEGER NOT NULL,
      ticketTypeId INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      totalAmount REAL NOT NULL,
      paymentMethod TEXT DEFAULT 'M-Pesa',
      paymentStatus TEXT DEFAULT 'pending',
      mpesaReceiptNumber TEXT,
      mpesaTransactionDate DATETIME,
      phoneNumber TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (eventId) REFERENCES events(id),
      FOREIGN KEY (ticketTypeId) REFERENCES ticket_types(id)
    )
  `);

  // Tickets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticketNumber TEXT UNIQUE NOT NULL,
      orderId INTEGER NOT NULL,
      eventId INTEGER NOT NULL,
      userId INTEGER NOT NULL,
      attendeeName TEXT NOT NULL,
      attendeeEmail TEXT NOT NULL,
      ticketType TEXT NOT NULL,
      price REAL NOT NULL,
      qrCode TEXT,
      isCheckedIn INTEGER DEFAULT 0,
      checkedInAt DATETIME,
      isCancelled INTEGER DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders(id),
      FOREIGN KEY (eventId) REFERENCES events(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `);

  console.log('Database initialized successfully');
  } catch (err) {
    console.error('Database initialization failed:', err);
  }
}

export default db;
