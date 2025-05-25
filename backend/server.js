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
    'https://chaldean-archive-h44pvheri-amenohoshizoras-projects.vercel.app/servants'
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

if (process.env.NODE_ENV === 'production') {
  // Serve static files from frontend
  app.use(express.static(path.join(__dirname, 'frontend')));
  
  // Handle SPA routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
