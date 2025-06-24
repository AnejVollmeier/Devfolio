var express = require('express');
const path = require('path');
const knex = require('./knex');
const cors = require('cors');
const helmet = require('helmet'); // Dodamo za dodatno varnost
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Uvozi sanitizacijski middleware
const sanitizeMiddleware = require('./middleware/sanitizeMiddleware');

var app = express();

console.log('Starting server...');
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Server path: ${__dirname}`);

// Nastavi varnostne HTTP headerje
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            styleSrc: ["'self'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "https://res.cloudinary.com", "data:"],
            fontSrc: ["'self'", "https://cdn.jsdelivr.net"],
            connectSrc: ["'self'", "https://devfolio-nu8o.onrender.com"],
            // Dodaj ostale potrebne direktive
        }
    },
    xssFilter: true,
    noSniff: true,
    frameguard: { action: 'deny' }
}));

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

// Uporaba middleware-ov
app.use(express.json({ limit: '1mb' })); // Omeji velikost JSON zahtev
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Uporabi sanitizacijski middleware za vse zahteve
app.use(sanitizeMiddleware);

// Rate limiting za preprečevanje napadov s silo (brute force)
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minut
    max: 100, // omejitev na 100 zahtev v časovnem oknu
    message: { error: 'Preveč zahtev, poskusite kasneje.' }
});
app.use('/login', apiLimiter); // Uporabi na občutljivih poteh
app.use('/register', apiLimiter);

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

// Globalni error handler za preprečevanje odtekanja napak
app.use((err, req, res, next) => {
    console.error('Napaka na strežniku:', err.stack);
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Prišlo je do napake na strežniku.' 
        : err.message;
    res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});