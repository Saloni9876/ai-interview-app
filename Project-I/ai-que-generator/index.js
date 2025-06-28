// ✅ FILE: index.js (Node.js Backend with Gemini AI Studio Key)

// const express = require('express');
// const axios = require('axios');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const mysql = require('mysql2');

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.json());

// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// app.post('/api/generate', async (req, res) => {
//   const { domain } = req.body;
//   const prompt = `Generate 5 interview questions for ${domain} with medium difficulty.`;

//   try {
//     const response = await axios.post(
//       `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${GEMINI_API_KEY}`,
//       {  contents: [
//           { parts: [ { text: prompt } ] }
//         ]
//       } );

//     const questions = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     if (!questions) {
//       return res.status(500).json({ error: 'Invalid response from Gemini API' });
//     }

//     db.query(
//         'INSERT INTO questions (domain, content) VALUES (?, ?)',
//         [domain, questions],
//         (err, result) => {
//           if (err) {
//             console.error(" Failed to insert into DB:", err);
//           } else {
//             console.log("Inserted into DB. Insert ID:", result.insertId);
//           }
//         }
//       );    

//   } catch (error) {
//     console.error('Gemini API Error:', error.response?.data || error.message);
//     if (error.response?.status === 429) {
//       return res.status(429).json({ error: "Quota exceeded. Please try again later." });
//     }
//     res.status(500).json({ error: 'Failed to generate questions' });
//   }
// });

// const PORT = process.env.PORT || 5500;
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });


// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// db.connect(err => {
//   if (err) {
//     console.error("DB connection failed:", err);
//   } else {
//     console.log(" MySQL Connected!");
//   }
// });

// ✅ FILE: index.js (updated backend with feedback route)

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

// Serve frontend folder if needed
app.use(express.static(path.join(__dirname, '../frontend')));

// MySQL connection setup
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("❌ DB connection failed:", err);
  } else {
    console.log("✅ MySQL Connected!");
  }
});

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Route 1: Generate Interview Questions
app.post('/api/generate', async (req, res) => {
  const { domain } = req.body;
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
          console.error("❌ Failed to save to DB:", err);
          return res.status(500).json({ error: "DB Insert Failed" });
        } else {
          console.log("✅ Questions saved to DB with ID:", result.insertId);
          res.status(200).json({ questions });
        }
      }
    );

  } catch (error) {
    console.error("❌ Gemini API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// Route 2: Generate Feedback on Answer
app.post('/api/feedback', async (req, res) => {
  const { answer } = req.body;

  const prompt = `Give constructive feedback on this interview answer:\n\"${answer}\"\nBe concise and professional.`;

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

    res.status(200).json({ feedback });

  } catch (error) {
    console.error("❌ Feedback API error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to generate feedback" });
  }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
