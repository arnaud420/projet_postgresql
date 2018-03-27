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

    fromFileToDate ([ year, month, day, hour, min, sec ]) {
        return new Date(year, month, day, hour, min, sec);
    }

    validateFile (filename, databases) {
        const filestat = path.parse(filename);
        const [ dbname, createdAt ] = filestat.name.split('_');

        if (filestat.ext !== '.sql' || databases.indexOf(dbname) === -1){
            return null;
        }

        const timestamp = this.fromFileToDate(createdAt.split('-'))
        return {
            filename: filename,
            database: dbname,
            timestamp: timestamp 
        };
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

