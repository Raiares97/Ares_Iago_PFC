const express = require('express');
const router = express.Router();

const respuesta = require('../../red/respuestas.js');
const controlador = require('./controlador.js');
const { ro } = require('@faker-js/faker');


router.get('/', todos);
router.get('/id/:id', uno);
router.get('/login',login);
router.post('/', agregar);
router.put('/', update);
router.delete('/', eliminar);
router.get('/initialize/:initialize', initialize);

/**Para la inizializacion de la base de datos*/
async function initialize(req, res, next) {
    try{
        const items = await controlador.initialize();
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    }
};
    
async function todos(req, res, next) {
    try{
        const items = await controlador.todos();
        respuesta.success(req, res, items, 200);
        }catch(err){
            next(err);
        }

};

 async function uno(req, res, next){
    try{
    const items = await controlador.uno(req.params.id);
    respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    }
};

async function agregar(req, res,next){
    try{
    const items = await controlador.agregar(req.body);
    respuesta.success(req, res, "Añadido usuario:" + req.body.nombre, 200);
    }catch(err){
        next(err);
    }
}

async function eliminar(req, res,next){
    try{
    const items = await controlador.eliminar(req.body);
    respuesta.success(req, res, "Usuario eliminado", 200);
    }catch(err){
        next(err);
    }
};

async function update(req, res,next){
    try{
    //const items = await controlador.update(req.body);
    console.log(req.headers.authorization);
    respuesta.success(req, res, await controlador.update(req.headers.authorization,req.body) , 200);
    }catch(err){
        next(err);
    }
}

async function login(req, res,next){
    try{
        const items = await controlador.uno(req.body.nombre);
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    }
}

module.exports = router;