const db = require('../../db/mysql.js');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../../config');
const tabla = "usuarios";

function todos() {
    return db.todos(tabla);
}

function uno(id) {
    return db.uno(tabla, id);
}

function agregar(body) {
    db.agregar(tabla, body)
    return {message:'Usuario: ' + body.nombre + ' creado exitosamente'} ;
}

function update(user, body) {
    //Recoje el token y lo divide y decodifica para obtener el usuario y la contraseña
    return db.update(tabla, user, body);
}

function eliminar(body) {
    return db.eliminar(tabla, body);
}

function initialize() {
    db.initialize(tabla);
    return {message:'Tabla ' + tabla + ' inicializada'};
}

async function login(body, res) {
    var usuario = await db.buscarUsuarioPorNombre(body.name);

    if (usuario !== undefined) {
        if (usuario[0].password !== body.password) {
            return { message: 'Contraseña incorrecta' };
        }
           return { message: 'Login exitoso', usuario }; 
    } 
        return { message: 'Usuario no encontrado' };
}

module.exports = {
    todos,
    uno,
    agregar,
    update,
    eliminar,
    initialize,
    login,
};