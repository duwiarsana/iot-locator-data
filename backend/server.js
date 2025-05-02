// Simple Express backend for user registration & login (SQLite)
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./users.db');

// Create devices table if not exists
// id unik, latlong, alamatLokasi, mqttIp, mqttPort, mqttUsername, mqttPassword, topics (JSON)
db.run(`CREATE TABLE IF NOT EXISTS devices (
  id TEXT PRIMARY KEY,
  latlong TEXT,
  alamatLokasi TEXT,
  mqttIp TEXT,
  mqttPort TEXT,
  mqttUsername TEXT,
  mqttPassword TEXT,
  topics TEXT
)`);

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

// Endpoint GET daftar device
app.get('/devices', (req, res) => {
  db.all('SELECT * FROM devices', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    // Parse topics JSON jika ada
    const devices = rows.map(row => ({
      ...row,
      topics: row.topics ? JSON.parse(row.topics) : []
    }));
    res.json(devices);
  });
});

// Endpoint GET detail device
app.get('/devices/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM devices WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Device not found' });
    console.log('GET /devices/:id result:', row);
    res.json({ ...row, topics: row.topics ? JSON.parse(row.topics) : [], alamatLokasi: row.alamatLokasi || '' });
  });
});

// Endpoint PUT update device
app.put('/devices/:id', (req, res) => {
  const { id } = req.params;
  let { latlong, alamatLokasi, mqttIp, mqttPort, mqttUsername, mqttPassword, topics } = req.body;
  // Pastikan alamatLokasi selalu string!
  alamatLokasi = typeof alamatLokasi === 'string' ? alamatLokasi : '';
  console.log('PUT /devices/:id body:', req.body);
  db.run(
    'UPDATE devices SET latlong = ?, alamatLokasi = ?, mqttIp = ?, mqttPort = ?, mqttUsername = ?, mqttPassword = ?, topics = ? WHERE id = ?',
    [latlong, alamatLokasi, mqttIp, mqttPort, mqttUsername, mqttPassword, JSON.stringify(topics), id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (this.changes === 0) return res.status(404).json({ error: 'Device not found' });
      console.log('Device updated, id:', id, 'alamatLokasi:', alamatLokasi);
      res.json({ success: true });
    }
  );
});

// Endpoint register device
app.post('/devices', async (req, res) => {
  try {
    const { id, latlong, alamatLokasi, mqttIp, mqttPort, mqttUsername, mqttPassword, topics } = req.body;
    if (!id || !mqttIp || !mqttPort || !topics) {
      return res.status(400).json({ error: 'Field wajib tidak lengkap' });
    }
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO devices (id, latlong, alamatLokasi, mqttIp, mqttPort, mqttUsername, mqttPassword, topics) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [id, latlong, alamatLokasi, mqttIp, mqttPort, mqttUsername, mqttPassword, JSON.stringify(topics)],
        function(err) {
          if (err) return reject(err);
          resolve();
        }
      );
    });
    res.json({ success: true, message: 'Device registered' });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

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

// Change Password Endpoint
app.post('/change-password', async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body;
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    // Get user from DB
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    // Check old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect.' });
    // Hash new password
    const hashed = await bcrypt.hash(newPassword, 10);
    // Update user password
    await new Promise((resolve, reject) => {
      db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, userId], function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
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

// Fallback route for any other GET requests (paling bawah)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
