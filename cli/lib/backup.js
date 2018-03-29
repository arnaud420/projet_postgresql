/*
 *  Github/TonyChG
 *  backup.js
 *  Description:
**/

const fs = require('fs');
const path = require('path');
const config = require('config');

module.exports = class Backups {
    constructor (rootPath) {
        this.rootPath = rootPath;
        this.loaded = {};
    }

    fromFileToDate (timestamp) {
        const [day, month, year, hours, min, sec] = timestamp.split('-');
        return new Date(year, month, day, hours, min, sec);
    }

    validateFile (filename, databases) {
        const [ fullname, ext ] = filename.split('.tar.gz');
        const [ dbname, createdAt ] = fullname.split('_');

        if (typeof(ext) !== 'undefined' && databases.indexOf(dbname) !== -1) {
            const timestamp = this.fromFileToDate(createdAt);

            if (!timestamp) return null;
            if (typeof(this.loaded[dbname]) === 'undefined') {
                this.loaded[dbname] = [];
            }
            return [dbname, {
                filename: filename,
                timestamp: timestamp,
                path: path.join(this.rootPath, filename)
            }];
        } else {
            return null;
        }
    }

    deleteBackup (path) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, err => {
                if (err) {
                    return reject(err)
                }
                return resolve(path);
            });
        })
    }

    async applyRetention (dbname) {
        const toDeleteBackupNb = this.loaded[dbname].length - config.save_retention;
        let step = 0;

        while (step < toDeleteBackupNb) {
            const backup = this.loaded[dbname].pop();
            try {
                const path = await this.deleteBackup(backup.path);
                console.log(`Delete old backup: ${path}`);
                step++;
            } catch (e) {
                console.error(e.message);
                process.exit(0);
            }
        }
        return step;
    }

    getLastBackup (dbname) {
        return this.loaded[dbname][0];
    }

    async load (databases) {
        const files = fs.readdirSync(this.rootPath);

        for (let i = 0; i < files.length; i++) {
            const [ dbname, backup ] = this.validateFile(files[i], databases);
            if (dbname && backup) this.loaded[dbname].push(backup);
        }

        const loadedDatabase = Object.keys(this.loaded);
        let step = 0;
        while (step < loadedDatabase.length) {
            const name = loadedDatabase[step];
            this.loaded[name] = this.loaded[name].sort((a, b) => b.timestamp - a.timestamp);
            await this.applyRetention(name);
            step++;
        }
        return Object.keys(this.loaded);
    }
}

