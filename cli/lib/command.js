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
        if (this.options.restore && this.options.save || this.options.all) {
            console.error(`Can't save and restore a database at the same time.`);
            process.exit(42);
        }
        else if (this.options.restore && this.options.all || this.options.save) {
            console.error(`Can't save all databases and restore a database at the same time.`);
            process.exit(42);
        }
        else if (this.options.save && this.options.all) {
            console.error(`'--all' already save all databases. Try '-s' for save a specific database or '-a' for save all databases`);
            process.exit(42);
        }
        else {
            console.error(`Invalid argument. At least 1 argument is required. For example try '-r' to restore a saved database
             or '-a' to save all databases.`);
            process.exit(42);
        }
    }
}

module.exports = Command;

