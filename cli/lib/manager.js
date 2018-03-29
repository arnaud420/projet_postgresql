/*
 *  Github/TonyChG
 *  manager.js
 *  Description:
**/

const fs = require('fs');
const path = require('path');

const mysql = require('mysql');
const config = require('config');

// Import default class
const Backups = require('./backup');
const Database = require('./database');

class Manager {
    constructor ({ host, user, password }, cmd, logging=true) {
        this.host = host;
        this.user = user;
        this.password = password;

        this.databases = [];
        this.connection = mysql.createConnection({ host, user, password });
        this.cmd = cmd;
        this.saveCache = [];

        this.backups = new Backups(config.backupPath);
        this.logging = logging;
    }

    get dbnames() {
        return this.databases.map(db => db.name);
    }

    get timestamp () {
        return new Date().toISOString();
    }

    get backupslist () {
        return this.backups.list;
    }

    log (message, err=false) {
        if (this.logging) {
            if (!err) {
                console.log(message);
            } else {
                console.error(message);
            }
        }
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
            this.log(`Database connected.`);
            return null;
        } catch (e) {
            this.log('Fail to connect to database.', true);
            this.log(e.message, true);
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

            this.log(`Found database: ${dbname}`);
            tables.forEach(table => {
                this.log(`--> Load table: ${table}`);
            });
            this.databases.push(database);
        }
    }

    async loadBackups () {
        const loadedDb = await this.backups.load(this.dbnames);
        loadedDb.forEach(dbname => {
            const lastBackup = this.backups.getLastBackup(dbname);
            this.log(`Last backup: ${lastBackup.filename}`);
        });
    }

    async save (databaseToSave) {
        if (databaseToSave) {
            databaseToSave = this.databases.filter(db => {
                return (databaseToSave.indexOf(db.name) !== -1);
            });
        } else {
            databaseToSave = this.databases
        }

        let step = 0;
        while (step < databaseToSave.length) {
            const db = databaseToSave[step];

            this.log(`Saving database --> ${db.name}`);
            try {
                const status = await db.save();
            } catch (err) {
                throw err;
            }
            step++;
        }
    }
}

module.exports = Manager

