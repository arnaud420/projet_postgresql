/*
 *  Github/TonyChG
 *  index.js
 *  Description:
**/

const { Client } = require('pg')
const config = require('config').database

module.exports = (dbname) => {
    const client = new Client({
            user: config.user,
            host: config.host,
            password: config.password,
            port: config.port || 5432,
            database: dbname
    })

    return client
}

