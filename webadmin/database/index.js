/*
 *  Github/TonyChG
 *  index.js
 *  Description:
**/

const AdminDB = require('./AdminDB')
const config = require('config').database

async function listAllDb () {
    const schema = new AdminDB('postgres')
    const client = await schema.getPgClient()
    const tables = await client.query('SELECT * FROM pg_database WHERE datistemplate = false')

    return tables.rows
}

module.exports = {
    AdminDB,
    listAllDb
}
