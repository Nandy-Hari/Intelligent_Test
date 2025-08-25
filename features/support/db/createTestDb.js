/**
 * Script to create a test SQLite database for database testing
 */
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

async function createTestDatabase() {
  const dbPath = path.join(__dirname, '..', 'test-database.db');
  
  // Remove existing database if it exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Removed existing test database');
  }
  
  try {
    // Open database connection
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    console.log('Creating test database...');
    
    // Create tables
    await db.exec(`
      CREATE TABLE users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        first_name TEXT,
        last_name TEXT,
        role TEXT NOT NULL,
        active INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
      
      CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount REAL NOT NULL,
        status TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
      
      CREATE TABLE products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        active INTEGER DEFAULT 1
      );
      
      CREATE TABLE order_items (
        order_item_id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(order_id),
        FOREIGN KEY (product_id) REFERENCES products(product_id)
      );
    `);
    
    // Insert sample data
    await db.exec(`
      -- Insert users
      INSERT INTO users (username, password, email, first_name, last_name, role, active)
      VALUES 
        ('admin', 'password123', 'admin@example.com', 'Admin', 'User', 'admin', 1),
        ('user1', 'password123', 'user1@example.com', 'John', 'Doe', 'customer', 1),
        ('user2', 'password123', 'user2@example.com', 'Jane', 'Smith', 'customer', 1),
        ('inactive', 'password123', 'inactive@example.com', 'Inactive', 'User', 'customer', 0);
      
      -- Insert products
      INSERT INTO products (name, description, price, stock, active)
      VALUES
        ('Laptop', 'High-performance laptop', 999.99, 10, 1),
        ('Smartphone', 'Latest smartphone model', 699.99, 20, 1),
        ('Headphones', 'Noise-cancelling headphones', 199.99, 30, 1),
        ('Tablet', 'Ultra-thin tablet', 499.99, 15, 1),
        ('Monitor', 'Ultra-wide monitor', 349.99, 5, 1),
        ('Discontinued Item', 'This item is no longer available', 99.99, 0, 0);
      
      -- Insert orders
      INSERT INTO orders (user_id, order_date, total_amount, status)
      VALUES
        (1, '2025-07-01 10:00:00', 999.99, 'Completed'),
        (2, '2025-07-15 11:30:00', 899.98, 'Processing'),
        (2, '2025-07-25 14:45:00', 199.99, 'Shipped'),
        (3, '2025-08-01 09:15:00', 1049.98, 'Completed');
      
      -- Insert order items
      INSERT INTO order_items (order_id, product_id, quantity, price)
      VALUES
        (1, 1, 1, 999.99),
        (2, 2, 1, 699.99),
        (2, 3, 1, 199.99),
        (3, 3, 1, 199.99),
        (4, 4, 1, 499.99),
        (4, 3, 1, 199.99),
        (4, 5, 1, 349.99);
    `);
    
    await db.close();
    
    console.log('Test database created successfully!');
    console.log(`Database file: ${dbPath}`);
    
  } catch (error) {
    console.error('Error creating test database:', error);
  }
}

// Run the database creation
createTestDatabase();
