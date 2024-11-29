const express = require('express');
const morgarn = require('morgan');
const config = require('./config');

const app = express();
const usuarios = require('./modules/clientes/rutas.js');
const error = require('./middleware/error.js');
const errorHandler = require('./red/errors.js');

//Middlewares
app.use(morgarn('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'MzJ4!N^#9qTp@3$Q%Wxa&Zg*RvkL7', // Cambia esto por una clave segura
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,           // Cambiar a true si usas HTTPS
        httpOnly: true,          // Protege la cookie de acceso desde JS
        maxAge: 1000 * 60 * 60,  // 1 hora
    },
}

));

//Configuration
app.set("port", config.app.port);

//Rutas
app.use('/api/usuarios', usuarios);
app.use(errorHandler);



module.exports = app;