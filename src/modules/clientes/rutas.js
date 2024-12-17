const express = require('express');
const router = express.Router();
const respuesta = require('../../red/respuestas.js');
const controlador = require('./controlador.js');
const jwt = require('jsonwebtoken'); // Para el token de autenticación
const { secretKey } = require('../../config.js');

// Rutas
router.get('/', todos);
router.get('/id/:id', uno);
router.get('/session/login', login);
router.post('/session/logout', logout);
router.post('/add', agregar);
router.put('/update', verificarYExtenderSesion, update); // Middleware aplicado aquí
router.delete('/', verificarYExtenderSesion, eliminar); // También aquí
router.get('/initialize/:initialize', initialize);

// Middleware para verificar y extender sesión
function verificarYExtenderSesion(req, res, next) {
    // Obtener el token desde las cookies firmadas
    const token = req.signedCookies.session;

    // Si no existe el token, retornar un error
    if (!token) {
        return res.status(401).json({ error: 'Token no encontrado o sesión inválida' });
    }

    try {
        // Verificamos y decodificamos el token usando el secreto
        const decoded = jwt.verify(token, secretKey);
        
        // Almacenar el nombre del usuario en req.user
        req.user = { name: decoded.name,
            password: decoded.password,
            game_tag: decoded.game_tag,
            main_rol: decoded.main_rol,
            alt_rol: decoded.alt_rol,
         }; // Decodificamos el token y extraemos el nombre del usuario
        console.log(req.user);

        // Extender la duración de la cookie si es necesario (opcional)
        const newToken = jwt.sign({ name: req.user.name,
            password: req.user.password,
            game_tag: req.user.game_tag,
            main_rol: req.user.main_rol,            
            alt_rol: req.user.alt_rol,
        }, secretKey, { expiresIn: '1h' });

        // Establecer una nueva cookie con el nuevo token
        res.cookie('session', newToken, {
            httpOnly: true,
            signed: true,
            secure: true,  // Solo se enviará a través de HTTPS
            maxAge: 1000 * 60 * 60, // 1 hora de duración
        });

        // Continuamos con la solicitud
        next();
    } catch (err) {
        console.error('Error al verificar el token:', err.message);
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}


// Controladores
async function initialize(req, res, next) {
    try {
        const items = await controlador.initialize();
        respuesta.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }
}

async function todos(req, res, next) {
    try {
        var items = []
        if (req.signedCookies.session === undefined){
            items = "Inicia sesion primero";
        }else{
            items = await controlador.todos();
        }
        console.log(items);
        
        respuesta.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }
}

async function uno(req, res, next) {
    try {
        const items = await controlador.uno(req.params.id);
        respuesta.success(req, res, items, 200);
    } catch (err) {
        next(err);
    }
}

async function agregar(req, res, next) {
    try {
        respuesta.success(req, res, await controlador.agregar(req.body), 200);
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
}

async function update(req, res, next) {
    try {
        const result = await controlador.update(req.user, req.body);
        respuesta.success(req, res, result, 200);
    } catch (err) {
        next(err);
    }
}

// Ruta de login
async function login(req, res, next) {
    try {
        // Verificamos que el usuario exista
        const result = await controlador.login(req.body, res);
        console.log(result);
        if (result.message === "Login exitoso") {
            console.log(result);
            // Aquí tomamos el nombre del usuario directamente del resultado
            const userPayload = {
                name: result.usuario[0].nombre,
                password: result.usuario[0].password,
                game_tag: result.usuario[0].game_tag,
                main_rol: result.usuario[0].main_rol,
                alt_rol: result.usuario[0].alt_rol,
            };

            // Generamos el JWT con el nombre del usuario
            const token = jwt.sign(userPayload, secretKey, { expiresIn: '1h' });
            console.log(jwt.decode(token));
            // Establecer la cookie con el token
            res.cookie('session', token, {
                httpOnly: true,
                signed: true,
                secure: true,  // Solo se enviará a través de HTTPS
                maxAge: 1000 * 60 * 60, // 1 hora de duración
            });
        }

        // Responder con éxito
        respuesta.success(req, res, result.message, 200);
    } catch (err) {
        next(err);
    }
}

// Ruta de logout
async function logout(req, res, next) {
    try {
        // Eliminar la cookie de sesión
        res.clearCookie('session');
        respuesta.success(req, res, { mensaje: "Has cerrado sesión" }, 200);
    } catch (err) {
        next(err);
    }
}

module.exports = router;
