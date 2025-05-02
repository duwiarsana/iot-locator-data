// Simple Express backend for user registration & login (SQLite)
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./users.db');
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..')));

// Homepage
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to IoT Dashboard Backend',
    endpoints: {
      '/register': 'POST - Register new user',
      '/login': 'POST - Login existing user'
    }
  });
});

// Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Fallback route for any other GET requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Create users table if not exists
// username unique, password hashed
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  nama TEXT,
  nomor_hp TEXT,
  email TEXT
)`);

// Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { username, password, nama, nomor_hp, email } = req.body;
    
    if (!username || !password || !nama || !nomor_hp || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    console.log('Checking if username exists...');
    // Check if username exists
    const userExists = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          console.error('Error checking username:', err);
          reject(err);
        }
        resolve(row);
      });
    });

    if (userExists) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    console.log('Hashing password...');
    // Hash password and insert user
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    
    console.log('Inserting user into database...');
    await new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, password, nama, nomor_hp, email) VALUES (?, ?, ?, ?, ?)', 
             [username, hashedPassword, nama, nomor_hp, email], function(err) {
        if (err) {
          console.error('Error inserting user:', err);
          reject(err);
        }
        console.log('User inserted successfully with ID:', this.lastID);
        resolve(this.lastID);
      });
    });

    res.json({ success: true, message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      details: error.message 
    });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    console.log('Login attempt body:', req.body);
    const { username, password } = req.body;
    console.log('Parsed username:', username);
    console.log('Parsed password:', password);
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    // Get user from database
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          console.error('Database error:', err);
          reject(err);
        }
        resolve(row);
      });
    });

    if (!user) {
      console.log('User not found for username:', username);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found:', user);
    // Compare password
    const valid = await bcrypt.compare(password, user.password);
    console.log('Password compare result:', valid);
    if (!valid) {
      console.error('Password comparison failed:', {
        username: username,
        provided: password,
        stored: user.password,
        isValid: valid
      });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Set role in localStorage
    res.json({ 
      success: true, 
      userId: user.id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard page
app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../dashboard.html'));
});

// Get all users (admin only)
app.get('/users', async (req, res) => {
  const { role } = req.query;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' });
  }
  
  try {
    db.all('SELECT * FROM users', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user (admin only)
app.delete('/users/:id', async (req, res) => {
  const { role } = req.query;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' });
  }
  
  const { id } = req.params;
  
  try {
    db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, message: 'User deleted successfully' });
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role (admin only)
app.put('/users/:id/role', async (req, res) => {
  const { role } = req.query;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized - Admin access required' });
  }
  
  const { id } = req.params;
  const { newRole } = req.body;
  
  if (!['user', 'admin'].includes(newRole)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  
  try {
    db.run('UPDATE users SET role = ? WHERE id = ?', [newRole, id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, message: 'User role updated successfully' });
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
