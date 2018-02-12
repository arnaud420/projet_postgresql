/*
 *  Github/TonyChG
 *  AdminDatabase.js
 *  Description:
**/

const { Client } = require('pg')
const config = require('config').database

class Database {
    constructor (name) {
        this.name = name
    }

    static async list () {
        const globalDatabase = new Database('postgres')
        const client = globalDatabase.client
        const tables = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false')

        return tables.rows
    }

    get client () {
        const client = new Client({
                user: config.user,
                host: config.host,
                port: config.port || 5432,
                password: config.password,
                database: this.name
        })

        client.connect()

        return client
    }

    save () {

    }

    generate () {

    }
}

module.exports = Database
