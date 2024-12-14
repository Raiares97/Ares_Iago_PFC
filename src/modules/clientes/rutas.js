const express = require('express');
const router = express.Router();

const respuesta = require('../../red/respuestas.js');
const controlador = require('./controlador.js');
const { ro } = require('@faker-js/faker');
const { signedCookie } = require('cookie-parser');


router.get('/', todos);
router.get('/id/:id', uno);
router.get('/session/login', login);
router.post('/session/logout', logout);
router.post('/', agregar);
router.put('/', update);
router.delete('/', eliminar);
router.get('/initialize/:initialize', initialize);

/**Para la inizializacion de la base de datos*/
async function initialize(req, res, next) {
    try {
        const items = await controlador.initialize();
        respuesta.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }
};

async function todos(req, res, next) {
    try {
        const items = await controlador.todos();
        respuesta.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }

};

async function uno(req, res, next) {
    try {
        const items = await controlador.uno(req.params.id);
        respuesta.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }
};

async function agregar(req, res, next) {
    try {
        const items = await controlador.agregar(req.body);
        respuesta.success(req, res, "Añadido usuario:" + req.body.nombre, 200);
    } catch (err) {
        next(err);
    }
}

async function eliminar(req, res, next) {
    try {
        const items = await controlador.eliminar(req.body);
        respuesta.success(req, res, "Usuario eliminado", 200);
    } catch (err) {
        next(err);
    }
};

async function update(req, res, next) {
    try {
        //const items = await controlador.update(req.body);
        console.log(req.headers.authorization);
        respuesta.success(req, res, await controlador.update(req.headers.authorization, req.body), 200);
    } catch (err) {
        next(err);
    }
}


const fakeDB = {
    user1: { password: '12345', role: 'admin' },
    user2: { password: 'password', role: 'user' },
};

// Ruta de login con contador basado en cookies
async function login(req, res, next) {
    try {
        const { name, password } = req.body;
        //Montar función para comprobar si el usuario existe
        //Montar función para comprobar si la seesion sigue activa
        if (!fakeDB[name] || fakeDB[name].password !== password) {
            next(new Error('No existe el usuario o la contraseña es incorrecta'));

        }
        let contador = req.cookies.contador || req.signedCookies.contador || 0;
        const sessionData = {
            name: fakeDB[name].name,
            role: fakeDB[name].role,
            password: fakeDB[name].password,
            expires: Date.now() + 1000 * 60 * 60, // 1 Hora
        };

        // Establecer la cookie actualizada
        res.cookie('session', JSON.stringify(sessionData), {
            httpOnly: true, // Protege la cookie para evitar acceso desde JavaScript
            signed: true,
            secure: true,   // Firma la cookie para mayor seguridad
            maxAge: 1000 * 60 * 60, // La cookie durará 1 hora
        });

        // Incrementar el contador o inicializarlo si no existe
        console.log(name, password);

        // Usar el controlador para obtener datos relacionados con el contador
        respuesta.success(req, res, sessionData, 200);
    } catch (err) {
        next(err);
    }
}

async function logout(req, res, next) {
    try {
        console.log(req.cookies.contador)
        console.log(req.signedCookies.contador)
        if (req.cookies.contador || req.signedCookies.contador === undefined) {
            respuesta.success(req, res, { mensaje: "No habia sesión abierta " }, 200);
        } else {
            // Borrar la cookie si existe
            res.clearCookie('contador');
            respuesta.success(req, res, { mensaje: "Has cerrado sesión" }, 200);
        }
    } catch (err) {
        next(err);
    }
}

module.exports = router;