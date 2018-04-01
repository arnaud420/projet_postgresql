/*
 *  Github/TonyChG
 *  AdminDatabase.js
 *  Description:
**/

const { Client } = require('pg')
const config = require('config').database
const fs = require('fs')
const path = require('path')

class Database {
    constructor (name) {
        this.name = name

        const client = new Client({
                user: config.user,
                host: config.host,
                port: config.port || 5432,
                password: config.password,
                database: this.name
        })

        client.connect()

        this.client = client
    }

    static async list () {
        const client = new Database('postgres').client
        const result = await client.query(
            'SELECT datname FROM pg_database WHERE datistemplate = false'
        )

        return result.rows
    }

    async query (queryString) {
        try {
            const result = await this.client.query(queryString)

            return result.rows
        } catch (error) {
            console.error(error)
            return
        }
    }

    async getTables () {
        const result = await this.client.query(
            `SELECT * FROM pg_catalog.pg_tables WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema'`
        )

        return result.rows
    }

    save () {

    }

    generate () {

    }
}

module.exports = Database
