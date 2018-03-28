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
const Backups = require('./backup');
const Database = require('./database');

class Manager {
    constructor ({ host, user, password }, cmd) {
        this.host = host;
        this.user = user;
        this.password = password;

        this.databases = [];
        this.connection = mysql.createConnection({ host, user, password });
        this.cmd = cmd;
        this.saveCache = [];

        this.backups = new Backups(config.backupPath);
    }

    get timestamp () {
        return new Date().toISOString();
    }

    get backupslist () {
        return this.backups.list;
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
            console.log(`Database connected.`);
            return null;
        } catch (e) {
            console.error('Fail to connect to database.');
            console.error(e.message);
            process.exit(50);
        }
    }

    async listDatabases () {
        const { results, fields } = await this.query('SHOW DATABASES');
        const dbnames = results.map(row => row.Database)
            .filter(name => config.ignored_databases.indexOf(name) === -1);

        for (let i = 0; i < dbnames.length; i++) {
            const dbname = dbnames[i];
            const database = new Database(dbname, this.connection);
            const tables = await database.loadTables();
            this.databases.push(database);
        }
    }

    loadBackups () {
        const numberOfBackups = this.backups.load(this.dblist);
        console.log(`${numberOfBackups} backups loaded.`)
    }

    save (dbname) {
    }

    store () {
    }

    exit() {
    }
}

module.exports = Manager

