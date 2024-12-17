require('dotenv').config();

module.exports = {
    secretKey :'Ares_Rodriguez_Iago_PFC_2024',
    app:{
        port: process.env.PORT || 4000,
    },
    mysql:{
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || 'pfc_iago',
    }
};