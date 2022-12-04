// 1) Modules
import dotenv from 'dotenv';
import 'dotenv/config';

import fs from 'fs';
import express from 'express';
import ejs from 'ejs';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// dotenv
dotenv.config({
    silent: process.env.NODE_ENV === 'production',
    path: '.env'
});



// 2) Express settings
const app = express();
if (process.env.NODE_ENV === 'production')
app.set('trust proxy', 1);
// view engine
app.set('view engine', 'ejs');
app.set('views', 'views');
ejs.delimiter = '?';



// 3) Middlewares
app.use(express.static('public'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(fileUpload());
app.use(cookieParser());
app.use(cors());
// Dev
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
// Limit requests from same IP
app.use('/', rateLimit({
    max: 1000,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
    standardHeaders: true,
	legacyHeaders: false,
}));
// Main middleware
app.use(async (req, res, next) => {
    req.time = Date.now();
    next();
});



// 4) Routes
// Home
app.get('/', (req, res) => {
    res.render('home', {
        title: 'API for students'
    });
});

// API
// get alphabet
app.get('/get/alphabet', (req, res) => {
    const alphabetJson = fs.readFileSync('./public/files/api/alphabet.json');
    const alphabet = JSON.parse(alphabetJson);
    res.status(200).json(alphabet);
});
// get metals
app.get('/get/metals', (req, res) => {
    const metalsJson = fs.readFileSync('./public/files/api/metals.json');
    const metals = JSON.parse(metalsJson);
    res.status(200).json(metals);
});
// get periodic table
app.get('/get/periodicTable', (req, res) => {
    const periodicJson = fs.readFileSync('./public/files/api/PeriodicTableJSON.json');
    const periodic = JSON.parse(periodicJson).elements;
    res.status(200).json(periodic);
});

// post test data
app.post('/send/test/:one?/:two?', (req, res) => {
    // error
    let result = {
        status: 'error',
        message: 'Missing posted data. Content-Type must be "application/json" or "application/x-www-form-urlencoded".'
    };
    // check data
    if (Object.keys(req.body).length) {
        // success
        result = {
            status: 'success',
            message: 'Good job!',
            data: {
                body: req.body,
                params: req.params,
                query: req.query
            }
        }
    }
    // result
    res.status(200).json(result);
});

// post file
app.post('/send/formdata', (req, res) => {
    // error
    let result = {
        status: 'error',
        message: 'Missing posted data. Content-Type must be "application/json" or "application/x-www-form-urlencoded".'
    };
    // check data
    if (Object.keys(req.body).length) {
        // success
        result = {
            status: 'success',
            message: 'Good job!',
            data: {
                body: req.body,
                params: req.params,
                query: req.query,
                files: {}
            },
        }
        // check files
        if (req.files) {
            // get file
            for (let key in req.files) {
                let { name, size, mimetype } = req.files[key];
                result.data.files[key] = { name, size, mimetype };
            }
        }
    }
    // result
    res.status(200).json(result);
});

// 404
app.all('*', (req, res) => {
    res.status(404).send('404 not found');
});



// 5) Start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`App running on port ${port}...`));
