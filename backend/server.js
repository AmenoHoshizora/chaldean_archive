require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

const app = express();
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(cors({
  origin: [
    'https://amenohoshizora.github.io',
    'http://localhost:3000'                  
  ]
}));
app.use(express.json());

// Routes
app.get('/api/servants', async (req, res) => {
  try {
    const { class: servantClass, search } = req.query;
    
    let query = 'SELECT * FROM servant';
    const params = [];
    
    if (servantClass) {
      query += ' WHERE class = $1';
      params.push(servantClass);
    }
    
    if (search) {
      query += servantClass ? ' AND' : ' WHERE';
      query += ' (name ILIKE $' + (params.length + 1) + 
               ' OR aka ILIKE $' + (params.length + 1) + ')';
      params.push(`%${search}%`);
    }
    
    const servants = await sql(query, params);
    res.json(servants);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = app;
