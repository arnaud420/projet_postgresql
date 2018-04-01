/*
 *  Github/TonyChG
 *  client.js
 *  Description:
**/

const mysql = require('mysql');

class Client {
    constructor({ host, user, password, database }, loglevel=true) {
        this.credentials = {
            host,
            user,
            password,
            database
        };

        this.connection = mysql.createConnection(this.credentials);
        this.logLevel = loglevel;

        this.database = database;
        this.tablenames = [];
    }

    get state () {
        return this.connection.state;
    }

    init () {
        return new Promise((resolve, reject) => {
            this.connection.connect(e => {
                if (e) reject(e);
                resolve(this.connection.state);
            });
        });
    }

    query (queryString) {
        return new Promise((resolve, reject) => {
            this.connection.query(queryString, (e, results, fields) => {
                if (e) reject(e);
                resolve({ results, fields });
            });
        });
    }

    async fetchTables () {
        try {
            const { results, fields } = await this.query('SHOW TABLES');

            for (let i = 0; i < results.length; i++) {
                const row = results[i];
                this.tablenames.push(row[Object.keys(row).toString()]);
            }
            return this.tablenames;
        } catch (e) {
            throw e;
        }
    }

    end () {
        this.connection.end();
    }
}

module.exports = Client;

