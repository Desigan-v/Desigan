import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables from .env file
dotenv.config();

// Create a new PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const app = express();

// Middleware to parse incoming JSON requests
app.use(express.json());

// 1. GET all users from the database
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. GET a user by ID from the database
app.get('/user/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. POST a new user to the database
app.post('/adduser', async (req, res) => {
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. PUT (Update) an existing user by ID in the database
app.put('/upduser/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, userId]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 5. DELETE a user by ID from the database
app.delete('/deluser/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
    if (result.rows.length > 0) {
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
