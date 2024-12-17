const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const https = require('https');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const usuarios = require('./modules/clientes/rutas.js');
const errorHandler = require('./red/errors.js');

const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("Ares_Iago_PFC_2024"));
app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect(`https://${req.headers.host}${req.url}`);
    }
    next();
});

// Configuration
app.set("port", config.app.port);

// Rutas

app.use('/api/usuarios', usuarios);
app.use(errorHandler);

module.exports = app;