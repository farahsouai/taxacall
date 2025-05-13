const express = require('express');
const axios = require('axios');
const router = express.Router();
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
console.log("🔐 Clé API chargée :", GEMINI_API_KEY); // Debug à supprimer après test

router.post('/chatbot/ask', async (req, res) => {
  const { question } = req.body;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: 'user',
            parts: [{ text: question }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "🤖 Pas de réponse générée.";
    res.json({ answer: reply });

  } catch (error) {
    console.error("❌ Erreur Gemini :", error?.response?.data || error.message);
    res.status(500).json({ answer: "❌ Erreur Gemini. Vérifie ta clé API ou ton modèle." });
  }
});

module.exports = router;
