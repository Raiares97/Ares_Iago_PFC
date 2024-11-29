const respuesta = require('./respuestas.js');
const error = require('../middleware/error.js');

function errorHandler(err, req, res, next) {
    console.log(err);
    const mensaje = err.message || "Error interno";
    const status = err.statusCode || 500;

    respuesta.error(req, res, mensaje, status);
}

module.exports = errorHandler;