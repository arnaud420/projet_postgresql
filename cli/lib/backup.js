/*
 *  Github/TonyChG
 *  backup.js
 *  Description:
**/

const fs = require('fs');
const path = require('path');

module.exports = class Backups {
    constructor (rootPath) {
        this.rootPath = rootPath;
        this.list = [];
    }

    fromFileToDate (timestamp) {
        return Date.parse(timestamp);
    }

    validateFile (filename, databases) {
        const [ fullname, ext ] = filename.split('.tar.gz');
        const [ dbname, createdAt ] = fullname.split('_');

        if (typeof(ext) !== 'undefined' && databases.indexOf(dbname) !== -1) {
            const timestamp = this.fromFileToDate(createdAt);

            return {
                filename: filename,
                database: dbname,
                timestamp: timestamp
            }
        } else {
            return null;
        }
    }

    load (databases) {
        const files = fs.readdirSync(this.rootPath);

        for (let i = 0; i < files.length; i++) {
            const backup = this.validateFile(files[i], databases);
            if (backup) this.list.push(backup);
        }
        return this.list.length;
    }
}

