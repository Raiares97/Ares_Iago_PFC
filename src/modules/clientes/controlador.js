const db = require('../../db/mysql.js');

const tabla = "usuarios";



function todos (){
    return db.todos(tabla);
}

function uno(id){
    return db.uno(tabla, id);
}

function agregar(body){
    return db.agregar(tabla, body);
}

function update(user, body){
    //Recoje el token y lo divide y decodifica para obtener el usuario y la contraseña
    user = user.split(" ")[1];
    user = atob(user);

    const credentials = {
        nombre:user.split(":")[0], 
        password:user.split(":")[1]
    };
    return db.update(tabla, credentials ,body);
}

function eliminar(body){
    return db.eliminar(tabla, body);
}

function initialize(){
    return db.initialize(tabla);
}
module.exports = {
    todos,
    uno,
    agregar,
    update,
    eliminar,
    initialize,
};