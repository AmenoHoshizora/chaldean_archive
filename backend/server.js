const path = require('path');
const express = require('express');
const { neon } = require('@neondatabase/serverless');

const app = express();
const sql = neon(process.env.DATABASE_URL);

// API Routes
app.get('/api/servants', async (req, res) => {
  try {
    const servants = await sql('SELECT * FROM servant');
    res.json(servants);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Static files middleware
app.use(express.static(path.join(__dirname, 'frontend')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

module.exports = app;
