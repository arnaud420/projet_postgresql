/*
 *  Github/TonyChG
 *  backup.js
 *  Description:
**/

const fs = require('fs');
const path = require('path');
const config = require('config');
const targz = require('targz');

module.exports = class Backups {
    constructor (rootPath) {
        this.rootPath = rootPath;
        this.loaded = {};
        this.tmpDirPath = "";
    }

    static getTableName(filepath) {
        const filename = path.basename(filepath);
        const [ fullname, ext ] = filename.split('.sql');
        const [ dbname, tablename, timestamp ] = filename.split('_');
        return tablename;
    }

    createTmpDir (filename) {
        return new Promise((resolve, reject) => {
            fs.mkdir(path.join('/tmp', filename), err => {
                if (err) {
                    return reject(err)
                }
                return resolve(path.join('/tmp', filename));
            });
        });
    }

    removeTmpDir () {
        fs.readdirSync(this.tmpDirPath)
            .forEach(file => {
                fs.unlinkSync(path.join(this.tmpDirPath, file));
            });
        fs.rmdirSync(this.tmpDirPath);
    }

    getBackupPaths (dbname) {
        return this.loaded[dbname].map(backup => backup.path);
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
                if (err) return reject(err)
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

    async decompress (backup) {
        this.tmpDirPath = await this.createTmpDir(backup.filename);
        return new Promise((resolve, reject) => {
            targz.decompress({
                src: backup.path,
                dest: this.tmpDirPath
            }, err => {
                if (err) return reject(err);
                return resolve(this.tmpDirPath);
            });
        });
    }

    async restore(dbname, backupPath) {
        let backupToRestore = {};

        if (!this.loaded[dbname]) {
            throw 'Database not loaded.';
        } else {
            if (backupPath) {
                const backupPaths = this.getBackupPaths(dbname);
                const backupIndex = backupPaths.indexOf(backupPath);

                if (backupIndex === -1) {
                    console.error(`Invalid backup file: ${backupPath}`);
                    process.exit(10);
                }
                backupToRestore = this.loaded[dbname][backupIndex];
            } else {
                backupToRestore = this.getLastBackup(dbname);
            }
            console.log(`Decompressing backup --> ${backupToRestore.filename}`);
            try {
                await this.decompress(backupToRestore);
                const sqlFiles = fs
                    .readdirSync(this.tmpDirPath)
                    .map(filepath => path.join(this.tmpDirPath, filepath));

                return sqlFiles;
            } catch(e) {
                throw e;
            }

            return {
                restoredBackup: backupToRestore
            };
        }
    }
}

