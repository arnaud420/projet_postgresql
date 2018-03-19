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
            .option('-r, --restore [backupFile]', 'Restore a saved database.', 'Last save')
            .option('-a, --all', 'Save all databases.')
            .option('-s, --save [dbName]', 'Save a specific database.', 'all')
            .option('-vv, --verbose', 'Show logs.')
            .parse(args);

        this.validateOptions();
    }

    validateOptions () {
        if (this.options.restore && this.options.save) {
            console.error(`Can't save and restore at the same time.`);
            process.exit(42);
        }
    }
}

module.exports = Command;

