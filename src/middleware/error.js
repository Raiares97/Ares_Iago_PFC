function error(message, statusCode) {
    var error = new Error(message);

    if (statusCode) {
        error.statusCode = statusCode;
    }
    return error;
}

function errorHandler(err, req, res, next) {
    if (!res.headersSent) {
        return respuesta.error(req, res, err.message, 500);
    }
    console.error('Error después de enviar la respuesta:', err);
}

module.exports = error;