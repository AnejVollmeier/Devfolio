var express = require('express');
const path = require('path');
const knex = require('./knex');
const cors = require('cors'); // Dodaj manjkajoči import za cors
require('dotenv').config({ path: path.join(__dirname, '.env') });
var app = express();

console.log('Starting server...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Server path: ${__dirname}`);

// CORS middleware z dodatkom domene devfolio.si
app.use(cors({
  origin: ['https://devfolio.si', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  credentials: true
}));

// Odstranjena duplicirana CORS konfiguracija

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// API status endpoint za korensko pot - bo deloval tudi na Heroku
app.get('/', (req, res) => {
  console.log('Root endpoint called!');
  res.json({ 
    status: 'ok', 
    message: 'DevFolio API je aktiven',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Serve static files from Backend Images directory (for technology and project images)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve static files from Frontend directory
// Opomba: te poti ne bodo delovale na Heroku zaradi subdir buildpack-a
app.use('/css', express.static(path.join(__dirname, '../Frontend/css')));
app.use('/js', express.static(path.join(__dirname, '../Frontend/js')));
app.use('/html', express.static(path.join(__dirname, '../Frontend/html')));
app.use('/img', express.static(path.join(__dirname, '../Frontend/img')));
app.use(express.static(path.join(__dirname, '../Frontend/html')));

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

// Frontend entry point - ta pot ne bo delovala na Heroku zaradi subdir buildpack-a
// Premaknjena po API statusni poti, zato da ne prepreči delovanja korenske poti
app.get('/frontend', (req, res) => {
  console.log('Frontend endpoint called!');
  res.sendFile(path.join(__dirname, '../Frontend/html/index.html'));
});

// API status endpoint za testiranje
app.get('/api/status', (req, res) => {
  console.log('API status endpoint called!');
  res.status(200).json({ 
    message: 'DevFolio API je aktivno!', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});