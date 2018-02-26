/*
 *  Github/TonyChG
 *  backup.js
 *  Description:
**/

const mysql = require('mysql');

module.exports = class Backup {
    constructor (dbname) {
        this.dblist = [];

        this.connection = mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'password'
        });
    }

    getDatabases () {
        return new Promise((resolve, reject) => {
            this.connection.query('SHOW DATABASES', (error, results, fields) => {
                if (error) return reject(error);

                this.dblist = results.map(row => row.Database)
                    .filter(name => ['information_schema', 'mysql', 'performance_schema'].indexOf(name) === -1);

                resolve(this.dblist);
            });
        })
    }
}
