/*
 *  Github/TonyChG
 *  manager.js
 *  Description:
**/

const config = require('config');
const Client = require('lib/client');
const Backup = require('lib/backup');

const fs = require('fs');
const path = require('path');

class Manager {
    constructor (options) {
        this.client = new Client({
            ...config.database.connection,
        });
        this.options = options;
        this.databases = [];
        this.backups = {};
    }

    quit (err) {
        if (err)  {
            console.error(err.message);
            process.exit(42);
        } else {
            console.log('Exiting.');
            process.exit(0);
        }
    }

    async start () {
        let databaseToSave = [];
        if (this.options.save) {
            if (this.options.save === true) {
                databaseToSave = this.databases;
            } else {
                databaseToSave = this.options.save.split('+');
                databaseToSave.forEach(name => {
                    if (this.databases.indexOf(name) === -1) {
                        throw new Error(`${name} doesn't exist.`);
                    }
                });
            }
            console.log(`Saving ${databaseToSave}`);
        } else if (this.options.restore) {
            if (!fs.existsSync(this.options.restore)) {
                throw new Error(`${this.options.restore} doesn't exist.`);
            } else {
                console.log(`Restore ${this.options.restore}`);
            }
        }
    }

    async loadDatabases () {
        try {
            const { results } = await this.client.query('SHOW DATABASES');
            results.forEach(row => {
                this.databases.push(row[Object.keys(row).toString()]);
            });
        } catch (e) {
            this.quit(e);
        }
    }

    sortBackups () {
        Object.keys(this.backups).forEach(name => {
            this.backups[name] = this.backups[name].sort((a, b) => {
                return b.timestamp - a.timestamp;
            });
        });
    }

    loadBackups () {
        const files = fs.readdirSync(config.backupPath);

        for (let i = 0; i < files.length; i++) {
            const filepath = path.join(config.backupPath, files[i]);
            const savedata = Backup.serializeSavename(filepath);
            if (!this.backups[savedata.database]) {
                this.backups[savedata.database] = [];
            }
            this.backups[savedata.database].push({
                timestamp: savedata.timestamp,
                path: savedata.path,
                name: savedata.name
            });
        }
        this.sortBackups();
    }
}

module.exports = Manager;

