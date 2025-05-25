require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');

DATABASE_URL='postgresql://neondb_owner:npg_CaZ5TAS0Ovpg@ep-raspy-bar-a1k7xmyh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'

const app = express();
const sql = neon(process.env.DATABASE_URL);

// Middleware
app.use(cors({
  origin: [
    'https://AmenoHoshizora.github.io',
    'http://localhost:3000'                  
  ]
}));
app.use(express.json());

// Routes
app.get('/servants', async (req, res) => {
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

app.get('/servants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [servant] = await sql('SELECT * FROM servant WHERE id = $1', [id]);
    
    if (!servant) {
      return res.status(404).json({ error: 'Servant not found' });
    }
    
    res.json(servant);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
