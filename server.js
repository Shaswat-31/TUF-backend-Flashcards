const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/build')));

// API routes
app.get('/api/flashcards', (req, res) => {
  db.query('SELECT * FROM flashcards', (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.json(results);
  });
});

app.post('/api/flashcards', (req, res) => {
  const { question, answer } = req.body;
  db.query(
    'INSERT INTO flashcards (question, answer) VALUES (?, ?)',
    [question, answer],
    (err, result) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).json({ id: result.insertId, question, answer });
    }
  );
});

app.put('/api/flashcards/:id', (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  db.query(
    'UPDATE flashcards SET question = ?, answer = ? WHERE id = ?',
    [question, answer, id],
    (err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(200).send('Flashcard updated');
    }
  );
});

app.delete('/api/flashcards/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM flashcards WHERE id = ?', [id], (err) => {
    if (err) {
      return res.status(500).send(err);
    }
    res.status(200).send('Flashcard deleted');
  });
});

// Route all requests to the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
