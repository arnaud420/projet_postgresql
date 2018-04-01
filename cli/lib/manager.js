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

    get logging() {
        return this.options.verbose;
    }

    async saveDatabases (databaseToSave) {
        let step = 0;

        while (step < databaseToSave.length) {
            try {
                const client = new Client({
                    ...config.database.connection,
                    database: databaseToSave[step]
                });
                await new Backup(client, this.logging).save();
                step++;
            } catch (e) {
                this.quit(e);
            }
        }
        return await this.applyRetention();
    }

    async restoreDatabase (savepath) {
        try {
            const savedata = Backup.serializeSavename(savepath);
            if (!savedata) throw new Error(`Invalid save format: ${savepath}`);

            await this.loadDatabases();

            if (this.databases.indexOf(savedata.database) === -1) {
                await this.client.query(`CREATE DATABASE ${savedata.database};`);
            }
            const client = new Client({
                ...config.database.connection,
                database: savedata.database
            });
            await new Backup(client, this.logging).restore(savepath);
        } catch (e) {
            this.quit(e);
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
                    if (this.databases.indexOf(name) === -1)
                        throw new Error(`${name} doesn't exist.`);
                });
            }
            console.log(`Saving ${databaseToSave}`);
            return await this.saveDatabases(databaseToSave);
        } else if (this.options.restore) {
            if (!fs.existsSync(this.options.restore)) {
                throw new Error(`${this.options.restore} doesn't exist.`);
            }
            console.log(`Restore ${this.options.restore}`);
            return await this.restoreDatabase(this.options.restore);
        } else if (this.options.last) {
            this.loadBackups();
            if (!this.backups[this.options.last]) {
                throw new Error(`No backup for database ${this.options.last}`);
            }
            console.log(`Restore last backup for ${this.options.last}`);
            const backup = this.backups[this.options.last].shift();
            return await this.restoreDatabase(backup.path);
        }
    }

    async loadDatabases () {
        try {
            const { results } = await this.client.query('SHOW DATABASES');
            results.forEach(row => {
                const dbname = row[Object.keys(row).toString()];
                if (config.ignored_databases.indexOf(dbname) === -1) {
                    this.databases.push(row[Object.keys(row).toString()]);
                }
            });
        } catch (e) {
            this.quit(e);
        }
    }

    async applyRetention() {
        this.loadBackups();
        Object.keys(this.backups).forEach(name => {
            const backups = this.backups[name];
            const backupToDelete = backups.length - config.save_retention;

            if (backupToDelete > 0) {
                for (let n = 0; n < backupToDelete; n++) {
                    const firstBackup = backups.pop();
                    if (!firstBackup || fs.unlinkSync(firstBackup.path)) {
                        throw new Error(`Impossible to delete old backup: ${firstBackup.name}`);
                    }
                }
            }
        });
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

