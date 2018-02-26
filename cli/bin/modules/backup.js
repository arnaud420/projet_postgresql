/*
 *  Github/TonyChG
 *  backup.js
 *  Description:
**/

const knex = require('knex');

module.exports = class Backup {
    constructor({ host, user, password, database }) {
        this.schema = knex({
                client: 'mysql',
                connection: {
                    host,
                    user,
                    password,
                    database: database ? database : 'information_schema'
                }
        });

        this.testConnection();
    }

    testConnection () {
        this.schema.raw('SELECT 1+1 as results').then(() => {
            console.log('Connection is OK');
        }).catch(error => {
            console.error('Error on connection test.');
        });
    }

    async listDatabases() {
        const resp = await this.schema.raw('show databases')
        const databases = resp[0]
        const dbnames = []

        databases.forEach(({ Database }) => {
            dbnames.push(Database);
        });

        return dbnames
    }

    export (dbname) {

    }
}
