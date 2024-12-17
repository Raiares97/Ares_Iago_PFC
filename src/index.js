const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./app');  // Importar la instancia de Express desde app.js

// Leer los certificados (cambiar paths por los correctos)
const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../ssl', 'claveprivada.pem')), // Clave privada
    cert: fs.readFileSync(path.join(__dirname, '../ssl', 'certificado.pem')), // Certificado
};

// Crear servidor HTTPS
https.createServer(sslOptions, app).listen(app.get("port"), () => {
    console.log(`Servidor HTTPS corriendo en el puerto ${app.get("port")}`);
});