// 1) Moduls
const path = require('path');
const fs = require('fs');
const express = require('express');
const ejs = require('ejs');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const os = require('os');
const morgan = require('morgan');
const dotenv = require('dotenv');

// dotenv
dotenv.config({ path: './.env' });

// express
const app = express();



// 2) View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
ejs.delimiter = '?';



// 3) Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(cors());
// Dev
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// Limit requests from same IP
app.use('/', rateLimit({
    max: 200,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
}));
// Main middleware
app.use(async (req, res, next) => {
    req.time = Date.now();
    next();
});



// 3) Routes
// Home
app.get('/', (req, res) => {
    res.render('home', {
        title: 'API for students'
    });
});
// API
app.get('/get/periodicTable', (req, res) => {
    const json = fs.readFileSync('./public/files/api/PeriodicTableJSON.json');
    const Periodic = JSON.parse(json).elements;
    res.status(200).json(Periodic);
});
// 404
app.all('*', (req, res) => {
    res.status(404).send('404 not found');
});



// 4) Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`App running on port ${port}...`));
