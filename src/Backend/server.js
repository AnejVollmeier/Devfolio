var express = require('express');
const path = require('path');
const knex = require('./knex');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '.env') });
var app = express();

console.log('Starting server...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Server path: ${__dirname}`);

// Posodobljena CORS konfiguracija za več domen
app.use(cors({
  origin: [
    'https://devfolio.si', 
    'https://www.devfolio.si', 
    'https://api.devfolio.si',
    'http://localhost:3000',
    'http://localhost:5173',  // Vite dev server
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'   // Vite dev server alternative
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API status endpoint za korensko pot
app.get('/', (req, res) => {
  console.log('Root endpoint called!');
  res.json({ 
    status: 'ok', 
    message: 'DevFolio API je aktiven',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Samo pot za statične slike - ostale poti niso potrebne ker bo frontend na Netlify
app.use('/images', express.static(path.join(__dirname, 'images')));

// Nalaganje API poti
const loginRoutes = require('./routes/login');
const registerRoutes = require('./routes/register');
const projectRoutes = require('./routes/projects');
const usersRoutes = require('./routes/users');
const technologiesRoutes = require('./routes/technologies');
const emailRoutes = require('./routes/email');

console.log('Registering routes...');

// Routes
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/projects', projectRoutes);
app.use('/users', usersRoutes);
app.use('/technologies', technologiesRoutes);
app.use('/email', emailRoutes);

// API status endpoint za testiranje
app.get('/api/status', (req, res) => {
  console.log('API status endpoint called!');
  res.status(200).json({ 
    message: 'DevFolio API je aktivno!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});