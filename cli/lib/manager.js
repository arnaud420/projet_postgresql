/*
 *  Github/TonyChG
 *  manager.js
 *  Description:
**/

const fs = require('fs');
const path = require('path');

const mysql = require('mysql');
const config = require('config');
const mysqldump = require('mysqldump');
const BackupsPool = require('./backup');

class Manager {
    constructor ({ host, user, password, database }, cmd) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.database = database;
        this.connection = mysql.createConnection({ host, user, password });
        this.cmd = cmd;

        this.backups = new BackupsPool(config.backupPath);
        this.dblist = [];
    }

    query (expression) {
        return new Promise((resolve, reject) => {
            this.connection.query(expression, (err, results, fields) => {
                if (err) return reject(err);
                return resolve({ results, fields });
            })
        })
    }

    async testConnection () {
        try {
            const { results, fields } = await this.query('SELECT 1+1 AS RESULT');
            return;
        } catch (e) {
            console.error('Fail to connect to database.');
            console.error(e.message);
            process.exit(50);
        }
    }

    async listDatabases () {
        const { results, fields } = await this.query('SHOW DATABASES');
        this.dblist = results.map(row => row.Database)
            .filter(name => config.ignored_databases.indexOf(name) === -1);
        return this.dblist;
    }

    save () {
        return new Promise((resolve, reject) => {
            const filename = `${this.database}-${new Date().valueOf()}.sql`;
            const fullPath = path.join(config.backupPath, filename);

            mysqldump({
                    host: this.host,
                    user: this.user,
                    password: this.password,
                    database: this.database,
                    dest: fullPath
            }, (err) => {
                if (err) return reject(err)
                return resolve(fullPath)
            })
        })
    }

    // listBackups () {
    //     this.backuplist = fs.readdirSync(config.backupPath)
    //         .map(file => path.join(config.backupPath, file));
    //     return this.backuplist;
    // }
}

module.exports = Manager

