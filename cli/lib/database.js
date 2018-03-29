/*
 *  Github/TonyChG
 *  database.js
 *  Description:
**/

const fs = require('fs');
const path = require('path');
const mysqldump = require('mysqldump');
const config = require('config');
const { host, user, password } = config.database.connection;
const targz = require('targz');

module.exports = class Database {
    constructor (name, connection) {
        this.name = name;
        this.connection = connection;

        this.backups = [];
        this.tables = [];
        this.saveFiles = [];
    }

    get timestamp () {
        const datetime = new Date();
        const formatTimestamps = [];
        formatTimestamps.push(datetime.getDate());
        formatTimestamps.push(datetime.getMonth());
        formatTimestamps.push(datetime.getFullYear());
        formatTimestamps.push(datetime.getHours());
        formatTimestamps.push(datetime.getMinutes());
        formatTimestamps.push(datetime.getSeconds());
        return formatTimestamps.join('-');
    }

    createTmpDir() {
        this.tmpDirPath = `/tmp/${this.name}_${this.timestamp}.tar.gz`;
        fs.mkdir(this.tmpDirPath, err => {
            if (err) {
                console.log(`Can't access ${this.tmpDirPath}`);
                process.exit(42);
            }
        });
    }

    getFilename (table) {
        return `${this.name}_${table}_${this.timestamp}.sql`;
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

    saveTable (tableName) {
        return new Promise((resolve, reject) => {
            console.log(`Saving table --> ${tableName}`);

            const filename = this.getFilename(tableName);
            const filepath = path.join(this.tmpDirPath, filename);

            mysqldump({
                host,
                user,
                password,
                database: this.name,
                dest: filepath,
                tables: [tableName]
            }, err => {
                if (err) reject(err);
                console.log(`New save file: ${filename}`);
                resolve(filepath);
            });
        });
    }

    removeTmpDir () {
        this.saveFiles.forEach(file => {
            const err = fs.unlinkSync(file);
            if (err) {
                console.error(err.message);
                process.exit(42);
            }
        });
        fs.rmdirSync(this.tmpDirPath);
    }

    async save (tablesToSave) {
        this.createTmpDir();

        if (!tablesToSave) tablesToSave = this.tables;

        let tableId = 0;
        while (tableId < tablesToSave.length) {
            try {
                const newSaveFile = await this.saveTable(tablesToSave[tableId]);
                this.saveFiles.push(newSaveFile);
                tableId++;
            } catch(err) {
                throw err;
            }
        }
        try {
            const archivePath = await this.compress();
            this.removeTmpDir();
        } catch (err) {
            throw err;
        }
        return tableId;
    }

    compress () {
        return new Promise((resolve, reject) => {
            const archiveName = path.basename(this.tmpDirPath);
            const archivePath = path.join(config.backupPath, archiveName);

            targz.compress({
                src: this.tmpDirPath,
                dest: archivePath
            }, err => {
                if (err) return reject(err);
                console.log(`New archive: ${archivePath}`);
                return resolve(archivePath);
            });
        });
    }
}
