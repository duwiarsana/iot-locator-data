const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./users.db');

const username = 'admin';
const password = 'admin123';
const nama = 'Administrator';
const nomor_hp = '1234567890';
const email = 'admin@example.com';
const role = 'admin';

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  db.run(
    'INSERT INTO users (username, password, nama, nomor_hp, email, role) VALUES (?, ?, ?, ?, ?, ?)',
    [username, hash, nama, nomor_hp, email, role],
    function (err) {
      if (err) {
        console.error('Error inserting admin:', err.message);
      } else {
        console.log('Admin user created successfully!');
      }
      db.close();
    }
  );
});
