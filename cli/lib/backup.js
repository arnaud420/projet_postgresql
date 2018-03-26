/*
 *  Github/TonyChG
 *  backup.js
 *  Description:
**/

const fs = require('fs');
const path = require('path');

module.exports = class BackupsPool {
    constructor (rootPath) {
        this.rootPath = rootPath;
        this.list = [];
    }

    static unserialize (backup) {

    }

    static serialize (backupPath) {
        try {
            const parsedPath = path.parse(backupPath);
            const [ database, createdAt ] = parsedPath.name.split('-');
            console.log(database, createdAt);
        } catch (err) {
            console.error(err.message);
        }
    }

    load () {
        this.list = fs.readdirSync(this.rootPath)
        return this.list.length;
    }

    sort () {
        const sortedBackup = [];

        this.list.forEach(path => {
            console.log(BackupsPool.serialize(path))
        });
    }
}
