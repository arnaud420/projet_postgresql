/*
 *  Github/TonyChG
 *  AdminDatabase.js
 *  Description:
**/

const { Client } = require('pg')
const config = require('config').database

class AdminDB {
    constructor (name) {
        this.name = name
    }

    getPgClient () {
        const client = new Client({
                user: config.user,
                host: config.host,
                port: config.port || 5432,
                password: config.password,
                database: this.name
        })
    }

    save () {
    }
}

module.exports = AdminDB
