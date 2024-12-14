const express = require('express');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const errorHandler = require('./red/errors.js');
const https = require('https');
const fs = require('fs');

const path = require('path');
const config = require('./config');
const usuarios = require('./modules/clientes/rutas.js');
const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser("Ares_Rodriguez_Iago_PFC_2024")); // Configurar cookies firmadas

// Configuration
app.set("port", config.app.port);

// Rutas
app.use('/api/usuarios', usuarios);
app.use(errorHandler);

module.exports = app;