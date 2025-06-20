var express = require('express');
const path = require('path');
const knex = require('./knex');
require('dotenv').config({ path: path.join(__dirname, '.env') });
var app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from Backend Images directory (for technology and project images)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Serve static files from Frontend directory
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
// Routes
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/projects', projectRoutes);
app.use('/users', usersRoutes);
app.use('/technologies', technologiesRoutes);
app.use('/email', emailRoutes);


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/html/index.html'));
});

// API status endpoint
app.get('/api/status', (req, res) => {
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