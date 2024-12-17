exports.success = (req, res, mensaje = "", status = 200) => {
    // Enviar respuesta en formato JSON
    res.status(status).json({
        error: false,
        status: status,
        body: mensaje,
    });
};

exports.error = (req, res, mensaje = "", status = 500) => {
    // Enviar respuesta en formato JSON
    res.status(status).json({
        error: true,
        status: status,
        body: mensaje,
    });
};