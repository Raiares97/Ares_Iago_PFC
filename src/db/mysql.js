const mysql = require('mysql');
const config = require('../config.js');
const { faker, fi } = require('@faker-js/faker');
const e = require('express');

const dbconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
    multipleStatements: true,
}

let conexion;

function conexionMysql() {
    conexion = mysql.createConnection(dbconfig);
    conexion.connect((err) => {
        if (err) {
            setTimeout(conexionMysql, 200);
        } else {
            console.log('Conexion a la base de datos establecida');
        }
    });

    conexion.on('error', err => {
        console.log('[db err]', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            conexionMysql();
        } else {
            throw err;
        }
    });
}

conexionMysql();

function initialize(tabla) {
    return new Promise((resolve, reject) => {
        conexion.query(`
            DROP TABLE IF EXISTS ${tabla};
            CREATE TABLE ${tabla} (
                id INT NOT NULL AUTO_INCREMENT,
                nombre VARCHAR(255) NOT NULL COLLATE utf8_bin,
                password VARCHAR(255) NOT NULL COLLATE utf8_bin,
                game_tag VARCHAR(255) NOT NULL COLLATE utf8_bin,
                main_rol VARCHAR(255) NOT NULL COLLATE utf8_bin,
                alt_rol VARCHAR(255) NOT NULL COLLATE utf8_bin,
                PRIMARY KEY (id)
            )`, (err, resultado) => {
            if (err) {
                return reject(err);
            }
            fillDB(tabla); // Llamada a la función para llenar la base de datos
            resolve(resultado);
        });
    });
}

/**
 * Roles posibles dentro de la aplicación, se permiten 2 y actualizar los roles en cualquier momento.
 */
const roles = ['Cargo Runner',
    'Data Runner',
    'Miner',
    'Escort',
    'Medic',
    'Courier',
    'Explorer',
    'Engineer',
    'Fighter Pilot'];

function fillDB(tabla) {
    const data = [];
    for (let i = 0; i < 5; i++) {
        const main_rol = roles[Math.floor(Math.random() * roles.length)];
        const alt_rol = roles.filter(role => role !== main_rol)[Math.floor(Math.random() * (roles.length - 1))];
        data.push({
            nombre: faker.person.firstName(),
            password: faker.internet.password(),
            game_tag: faker.internet.displayName(),
            main_rol: main_rol,
            alt_rol: alt_rol
        });
    }
    data.forEach(item => {
        new Promise((resolve, reject) => {
            conexion.query(`INSERT INTO ${tabla} SET ?`, item, (err, resultado) => {
                return err ? reject(err) : resolve(resultado);
            });
        });
        console.log("---------------------");
        console.log("Nombre:");
        console.log(item.nombre);
        console.log("Password:");
        console.log(item.password);
        console.log("Game Tag:");
        console.log(item.game_tag);
        console.log("Main Rol:");
        console.log(item.main_rol);
        console.log("Alt Rol:");
        console.log(item.alt_rol);
        console.log("---------------------");
    });
}

function todos(tabla) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla}`, (err, resultado) => {
            return err ? reject(err) : resolve(resultado);
        });
    });
}

function uno(tabla, id) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT * FROM ${tabla} WHERE ID=${id}`, (err, resultado) => {
            return err ? reject(err) : resolve(resultado);
        });
    });
}

function agregar(tabla, data) {
    return new Promise((resolve, reject) => {
        conexion.query(`INSERT INTO ${tabla} SET ?`, data, (err, resultado) => {
            return err ? reject(err) : resolve(resultado);
        });
    });
}

function update(tabla, user, data) {
    console.log("--------------------");
    console.log("Datos nuevos a actualizar:", data);
    console.log("Datos antiguos del usuario:", user);
    console.log("--------------------");

    return new Promise((resolve, reject) => {
        // Validar que el usuario esté autenticado
        if (!user) {
            return reject('No has iniciado sesión correctamente');
        }

        // Verificar que existan campos nuevos para actualizar
        const sanitizedData = sanitizeRequestBody(data);
        if (Object.keys(sanitizedData).length === 0) {
            return reject('No se han proporcionado datos válidos para actualizar');
        }

        // Verificar que el usuario exista en la base de datos
        console.log(user.name);
        const selectQuery = `SELECT * FROM ${tabla} WHERE nombre = ?`;
        conexion.query(selectQuery, [user.name], (err, resultados) => {
            if (err) {
                return reject(err);
            }

            // Si no se encuentran resultados, rechazamos la promesa
            if (resultados.length === 0) {
                return reject('No se encontró un registro con los identificadores proporcionados');
            }

            // Obtener los datos completos: mezclar datos antiguos (user) con los nuevos (data)
            const usuarioExistente = resultados[0];
            const datosCompletos = { 
                ...usuarioExistente,  // Datos actuales de la base de datos
                ...sanitizedData      // Datos nuevos a actualizar (sobrescriben si existen)
            };

            // Eliminar campos no permitidos o redundantes
            const datosFinales = sanitizeRequestBody(datosCompletos);

            // Construir la consulta de actualización
            const queryActualizar = `UPDATE ${tabla} SET ? WHERE nombre = ?`;
            conexion.query(queryActualizar, [datosFinales, user.name], (err, resultado) => {
                if (err) {
                    return reject(err);
                }
                resolve(resultado); // Resolución exitosa con el resultado de la actualización
            });
        });
    });
}

function eliminar(tabla, data) {
    return new Promise((resolve, reject) => {
        conexion.query(`DELETE FROM ${tabla} WHERE nombre = '${data.nombre}' AND game_tag = '${data.game_tag}'`, (err, resultado) => {
            return err ? reject(err) : resolve(resultado);
        });
    });
}

/**Para asegurarme de que las actualizaciones sean correctas, ya que le paso un array que puede venir con menos elementos
* de los que contiene la tabla.
*/ 
function sanitizeRequestBody(reqBody) {
    const expectedKeys = ['nombre', 'password', 'game_tag', 'main_rol', 'alt_rol'];

    return expectedKeys.reduce((acc, key) => {
        if (reqBody[key]) {
            acc[key] = reqBody[key]; // Solo agregar campos con valores válidos
        }
        return acc;
    }, {});
}

function buscarUsuarioPorNombre(nombre) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM usuarios WHERE nombre = ?`;
        conexion.query(query, [nombre], (err, resultado) => {
            if (err) {
                return reject(err);
            }
            if (resultado.length === 0) {
                return resolve(undefined); // Devolver undefined si no se encuentra ningún usuario
            }
            // Comparación case-sensitive en JS (aunque no es lo ideal)
            const usuarioEncontrado = resultado.filter(u => u.nombre === nombre);
            //console.log(usuarioEncontrado);
            resolve(usuarioEncontrado); // Devolver el usuario encontrado
        });
    });
}
 
module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
    initialize,
    update,
    buscarUsuarioPorNombre,
};