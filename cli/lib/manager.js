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

class Manager {
    constructor ({ host, user, password }, cmd) {
        this.host = host;
        this.user = user;
        this.password = password;
        this.connection = mysql.createConnection({ host, user, password });
        this.cmd = cmd;
        this.saveCache = [];

        this.backups = new Backups(config.backupPath);
        this.dblist = [];
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

        this.dblist = results.map(row => row.Database)
            .filter(name => config.ignored_databases.indexOf(name) === -1);
        return this.dblist;
    }

    loadBackups () {
        const numberOfBackups = this.backups.load(this.dblist);
        console.log(`${numberOfBackups} backups loaded.`)
    }

    save (dbname) {
        return new Promise((resolve, reject) => {
            const filename = `${dbname}_${this.timestamp}.sql`;
            const fullPath = path.join(config.backupPath, filename);

            mysqldump({
                host: this.host,
                user: this.user,
                password: this.password,
                database: dbname,
                dest: fullPath,
            }, err => {
                if (err) return reject(err.message);
                console.log(`New save created: ${filename}`);

                this.saveCache.push(fullPath);
                return resolve(fullPath);
            });
        });
    }

    store () {
        this.saveCache.forEach(save => {
            const filestat = path.parse(save);
            const savePath = path.join(__dirname, '..', save);
        });
    }

    exit() {
        process.exit(0);
    }
}

module.exports = Manager

