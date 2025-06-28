// ✅ FILE: index.js (Node.js Backend with Gemini AI Studio Key)

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.post('/api/generate', async (req, res) => {
  const { domain } = req.body;
  const prompt = `Generate 5 interview questions for ${domain} with medium difficulty.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      }
    );

    const questions = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!questions) {
      return res.status(500).json({ error: 'Invalid response from Gemini API' });
    }

    res.status(200).json({ questions });

  } catch (error) {
    console.error('❌ Gemini API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to generate questions' });
  }
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
