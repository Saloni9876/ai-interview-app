// ✅ FILE: index.js (Node.js backend with MySQL + Gemini + Full feedback management)
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Load API Key
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY is missing!');
  process.exit(1);
}

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL connection error:', err);
    process.exit(1);
  }
  console.log('✅ Connected to MySQL Database');
});


// ✅ Signup route
app.post('/api/signup', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (results.length > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    db.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, password], (err) => {
      if (err) return res.status(500).json({ error: "Failed to register user" });
      return res.status(200).json({ message: "Signup successful" });
    });
  });
});

// ✅ Login route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  db.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    res.status(200).json({ message: "Login successful" });
  });
});



// ✅ Route 1: Generate Interview Questions
app.post('/api/generate', async (req, res) => {
  const { domain } = req.body;

  if (!domain) {
    return res.status(400).json({ error: 'Domain is required' });
  }

  const prompt = `Generate 5 interview questions for ${domain} with medium difficulty.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const questions = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!questions) {
      return res.status(500).json({ error: 'Invalid response from Gemini API' });
    }

    res.status(200).json({ questions });

  } catch (error) {
    console.error('❌ Error generating questions:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

// ✅ Route 2: Submit Answer + Get Feedback + Save to DB
app.post('/api/feedback', async (req, res) => {
  const { answer, question, user_email } = req.body;

  if (!answer || !question || !user_email) {
    return res.status(400).json({ error: 'Answer, Question, and Email are required' });
  }

  const prompt = `Give constructive feedback on the following interview answer:\n\nQuestion: ${question}\nAnswer: ${answer}\n\nBe concise and professional.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const feedback = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!feedback) {
      return res.status(500).json({ error: 'No feedback generated' });
    }

    // ✅ Save to database
    db.query(
      'INSERT INTO feedback (user_email, question, answer, feedback) VALUES (?, ?, ?, ?)',
      [user_email, question, answer, feedback],
      (err, result) => {
        if (err) {
          console.error('❌ MySQL insert error:', err);
          return res.status(500).json({ error: 'Failed to save feedback' });
        }
        res.status(200).json({ feedback });
      }
    );

  } catch (error) {
    console.error('❌ Error generating feedback:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate feedback' });
  }
});

// ✅ Route 3: Load All Feedback by User Email
app.get('/api/user-feedback/:email', (req, res) => {
  const { email } = req.params;

  db.query(
    'SELECT * FROM feedback WHERE user_email = ? ORDER BY created_at DESC',
    [email],
    (err, results) => {
      if (err) {
        console.error('❌ MySQL fetch error:', err);
        return res.status(500).json({ error: 'Failed to fetch feedback' });
      }
      res.status(200).json(results);
    }
  );
});

// ✅ Route 4: Update Rating for Feedback
app.post('/api/rate-feedback', (req, res) => {
  const { id, rating } = req.body;

  db.query(
    'UPDATE feedback SET rating = ? WHERE id = ?',
    [rating, id],
    (err) => {
      if (err) {
        console.error('❌ Rating update error:', err);
        return res.status(500).json({ error: 'Failed to update rating' });
      }
      res.json({ message: 'Rating updated successfully' });
    }
  );
});

// ✅ Route 5: Update Answer and Regenerate Feedback
app.post('/api/update-answer', async (req, res) => {
  const { id, answer, question } = req.body;

  if (!id || !answer || !question) {
    return res.status(400).json({ error: 'ID, Answer, and Question are required' });
  }

  const prompt = `Give updated feedback for this revised interview answer:\n\nQuestion: ${question}\nAnswer: ${answer}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const feedback = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!feedback) {
      return res.status(500).json({ error: 'Failed to generate updated feedback' });
    }

    db.query(
      'UPDATE feedback SET answer = ?, feedback = ? WHERE id = ?',
      [answer, feedback, id],
      (err) => {
        if (err) {
          console.error('❌ Update error:', err);
          return res.status(500).json({ error: 'Failed to update feedback' });
        }
        res.json({ feedback });
      }
    );

  } catch (error) {
    console.error('❌ Error updating feedback:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to update feedback' });
  }
});

// ✅ Server Start
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
