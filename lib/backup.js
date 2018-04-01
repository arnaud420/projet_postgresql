/*
 *  Github/TonyChG
 *  backup.js
 *  Description:
**/

const fs = require('fs');
const path = require('path');
const config = require('config');
const targz = require('targz');
const mysqldump = require('mysqldump');

class Backup {
    constructor (client, logging, savepath) {
        this.savepath = config.backupPath;
        this.client = client;
        this.logging = logging || false;
    }

    get dbname () {
        return this.client.database;
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

    get newSavename () {
        return `${this.dbname}.${this.timestamp}.tar.gz`;
    }

    log (message, isError) {
        if (this.logging) {
            if (isError) {
                console.error(message);
            } else {
                console.log(message);
            }
        }
    }

    // SAVING
    createFilesCache (cachepath) {
        return new Promise((resolve, reject) => {
            fs.mkdir(cachepath, e => {
                if (e) return reject(e);
                this.cachepath = cachepath;
                resolve();
            });
        });
    }

    deleteFilesCache () {
        return new Promise((resolve, reject) => {
            fs.readdirSync(this.cachepath).forEach(file => {
                fs.unlinkSync(path.join(this.cachepath, file))
            });
            fs.rmdir(this.cachepath, e => {
                if (e) reject(e);
                resolve();
            });
        });
    }

    filterTables (tablenames) {
        if (tablenames) {
            return tablenames.filter(name => {
                return this.client.tablenames.indexOf(name) !== -1;
            });
        } else {
            return this.client.tablenames;
        }
    }

    saveTable (name) {
        return new Promise((resolve, reject) => {
            const filename = `${name}.sql`;
            const filepath = path.join(this.cachepath, filename);

            mysqldump({
                ...this.client.credentials,
                dest: filepath,
                tables: [name]
            }, e => {
                if (e) return reject(e);
                resolve(filepath);
            });
        });
    }

    async saveAllTables (tableToSave) {
        let tIndex = 0;

        while (tIndex < tableToSave.length) {
            try {
                const tablename = tableToSave[tIndex];
                const newSave = await this.saveTable(tablename);
                this.log(`New savefile => ${newSave}`);
                tIndex++;
            } catch (e) {
                throw e;
            }
        }
        return tIndex;
    }

    compress () {
        return new Promise((resolve, reject) => {
            const cachename = path.basename(this.cachepath);
            const destpath = path.join(config.backupPath, cachename)

            targz.compress({
                src: this.cachepath,
                dest: destpath,
            }, e => {
                if (e) return reject(e);
                resolve(destpath);
            });
        });
    }

    async save (tableToSave) {
        const newSavename = this.newSavename;

        try {
            await this.client.fetchTables();
            tableToSave = this.filterTables(tableToSave)
            this.log(`Start saving tables: ${tableToSave.toString()}`);
            await this.createFilesCache(path.join('/tmp', newSavename));
            await this.saveAllTables(tableToSave);
            await this.compress();
            await this.deleteFilesCache();
            return;
        } catch (e) {
            if (this.cachepath) {
                await this.deleteFilesCache();
            }
            throw e;
        }
    }

    // RESTORE
    static fromStrToDate (datetime) {
        const [ day, month, year, hour, min, sec ] = datetime.split('-');
        return new Date(year, month, day, hour, min, sec);
    }

    async decompress (savedata) {
        return new Promise((resolve, reject) => {
            targz.decompress({
                src: savedata.path,
                dest: this.cachepath
            }, e => {
                if (e) reject(e);
                resolve();
            });
        });
    }

    static serializeSavename (savepath) {
        if (fs.existsSync(savepath)) {
            const savename = path.basename(savepath);
            const [ filename, ext ] = savename.split('.tar.gz');
            if (typeof(ext) !== 'undefined') {
                const [ dbname, timestamp ] = filename.split('.');
                if (dbname && timestamp) {
                    const datetime = Backup.fromStrToDate(timestamp);
                    if (datetime) {
                        return {
                            database: dbname,
                            timestamp: datetime,
                            path: savepath,
                            name: savename
                        };
                    }
                }
            }
        }
        return null;
    }

    getFileContent (filepath) {
        return new Promise((resolve, reject) => {
            const [ tablename, ext ] = path.basename(filepath).split('.sql');
            if (typeof(ext) !== 'undefined') {
                fs.readFile(filepath, 'utf-8', (err, data) => {
                    if (err) reject(err);
                    const content = data.toString().split(';');
                    return resolve({
                        table: tablename,
                        content
                    });
                });
            } else {
                reject(new Error('Syntax error'));
            }
        });
    }

    async importFile (filepath) {
        let queryIndex = 0;

        try {
            const { table, content } = await this.getFileContent(filepath);
            await this.client.fetchTables();

            if (this.client.tablenames.indexOf(table) !== -1) {
                await this.client.query(`TRUNCATE table ${table};`);
            }

            while (queryIndex < content.length) {
                const query = content[queryIndex].trim();
                if (query.length) {
                    await this.client.query(query);
                }
                queryIndex++;
            }
            return queryIndex;
        } catch (e) {
            throw e;
        }
    }

    async executeFiles () {
        const files = fs.readdirSync(this.cachepath).reverse();
        let index = 0;

        while (index < files.length) {
            const filepath = path.join(this.cachepath, files[index]);
            try {
                await this.importFile(filepath);
                index++;
            } catch (e) {
                throw e;
            }
        }
        return index;
    }

    async restore (savepath) {
        try {
            const savedata = Backup.serializeSavename(savepath);
            if (savedata) {
                await this.client.query('SET FOREIGN_KEY_CHECKS=0;');
                await this.createFilesCache(path.join('/tmp', savedata.name));
                await this.decompress(savedata);
                await this.executeFiles();
                await this.deleteFilesCache();
                await this.client.query('SET FOREIGN_KEY_CHECKS=1;');
            } else {
                throw new Error(`File doesn't exist. ${savepath}`);
            }
        } catch (e) {
            if (this.cachepath) {
                await this.deleteFilesCache();
            }
            throw e;
        }
    }
}

module.exports = Backup;

