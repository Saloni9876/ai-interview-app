// ✅ FILE: index.js (backend with feedback + question storing, user email based)

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

app.use(express.static(path.join(__dirname, '../frontend')));

// Debug incoming request method + path
app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url}`);
  next();
});

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
  } else {
    console.log("✅ MySQL Connected!");
  }
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ✅ Route 1: Generate Questions and Store to DB
app.post('/api/generate', async (req, res) => {
  const { domain, user_email } = req.body;
  const prompt = `Generate 5 interview questions for ${domain} with medium difficulty.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const questions = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!questions) {
      return res.status(500).json({ error: "Invalid Gemini API response" });
    }

    db.query(
      'INSERT INTO questions (domain, content) VALUES (?, ?)',
      [domain, questions],
      (err, result) => {
        if (err) {
          console.error("❌ DB insert failed:", err);
          return res.status(500).json({ error: "DB insert failed" });
        }
        console.log("✅ Questions stored with ID:", result.insertId);
        res.status(200).json({ questions });
      }
    );

  } catch (error) {
    console.error("❌ Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// ✅ Route 2: Generate Feedback and Store Answer + Feedback + Question
app.post('/api/feedback', async (req, res) => {
  const { answer, question, user_email } = req.body;

  const prompt = `Give constructive feedback on the following interview answer:\n\nQuestion: ${question}\nAnswer: ${answer}\n\nBe concise and professional.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    const feedback = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!feedback) {
      return res.status(500).json({ error: "No feedback received." });
    }

    // ✅ Store question, answer, feedback, and user_email in DB
    db.query(
      'INSERT INTO feedback (user_email, question, answer, feedback) VALUES (?, ?, ?, ?)',
      [user_email, question, answer, feedback],
      (err, result) => {
        if (err) {
          console.error("❌ Failed to insert into feedback table:", err);
          return res.status(500).json({ error: "DB insert failed" });
        }
        console.log("✅ Feedback stored with ID:", result.insertId);
        res.status(200).json({ feedback });
      }
    );

  } catch (error) {
    console.error("❌ Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
// ..........adding feedback dashboard ...
app.get('/api/user-feedback/:email', (req, res) => {
  const userEmail = req.params.email;

  db.query(
    'SELECT * FROM feedback WHERE user_email = ? ORDER BY created_at DESC',
    [userEmail],
    (err, results) => {
      if (err) {
        console.error("❌ Failed to fetch feedback:", err);
        return res.status(500).json({ error: "DB fetch failed" });
      }
      res.json(results);
    }
  );
});
// .......rating of feedback............./
app.post('/api/rate-feedback', (req, res) => {
  const { id, rating } = req.body;
  db.query('UPDATE feedback SET rating = ? WHERE id = ?', [rating, id], (err) => {
    if (err) return res.status(500).json({ error: "Rating update failed" });
    res.json({ message: "Rating saved" });
  });
});
// ......... update answer/...
app.post('/api/update-answer', async (req, res) => {
  const { id, answer, question } = req.body;

  const prompt = `Give feedback on this updated interview answer:\n\nQuestion: ${question}\nAnswer: ${answer}`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    const feedback = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    db.query(
      'UPDATE feedback SET answer = ?, feedback = ? WHERE id = ?',
      [answer, feedback, id],
      (err) => {
        if (err) return res.status(500).json({ error: "Update failed" });
        res.json({ feedback });
      }
    );

  } catch (err) {
    console.error("Gemini update error:", err);
    res.status(500).json({ error: "Gemini failed" });
  }
});
