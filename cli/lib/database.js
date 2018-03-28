/*
 *  Github/TonyChG
 *  database.js
 *  Description:
**/

module.exports = class Database {
    constructor (name, connection) {
        this.name = name;
        this.connection = connection;

        this.backups = [];
        this.tables = [];
    }

    loadTables () {
        return new Promise((resolve, reject) => {
            this.connection.query(`SHOW tables FROM ${this.name}`, (err, results, fields) => {
                if (err) return reject(err.message);
                results.forEach(row => {
                    const keys = Object.keys(row);
                    this.tables.push(row[keys[0]]);
                });
                return resolve(this.tables);
            });
        });
    }

    save (tablesToSave) {

    }

    restore (tablesToRestore) {

    }
}
