/*
 *  Github/TonyChG
 *  command.js
 *  Description:
**/

const program = require('commander')
const fs = require('fs');

class Command {
    constructor (args) {
        this.options = program.version('0.1.0')
            .option('-r, --restore [backupFile]', 'Restore a saved database.')
            .option('-s, --save [dbnames]', 'Save a specific database db1+db2+db3.')
            .option('-v, --verbose', 'Show logs.')
            .option('-l, --last [dbname]', 'Restore available backup for [dbname]')
            .parse(args);

        this.validateOptions();
    }

    validateOptions () {
        if (this.options.save && this.options.restore) {
            console.error(`Can't save and restore at the same time.`);
            process.exit(1);
        }
    }
}

module.exports = Command;

