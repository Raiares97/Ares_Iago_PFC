function error(message, statusCode) {
    var error = new Error(message);

    if (statusCode) {
        error.statusCode = statusCode;
    }
    return error;
}

module.exports = error;