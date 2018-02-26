/*
 *  Github/TonyChG
 *  index.js
 *  Description:
**/

const generate = require('./modules/generate');
const Backup = require('./modules/backup');
const newBackup = new Backup('test');
const mysqldump = require('mysqldump');

async function main() {
    try {
        const dbnames = await newBackup.getDatabases()

        dbnames.forEach(name => {
            mysqldump({
                    host: 'localhost',
                    user: 'root',
                    password: 'password',
                    database: name,
                    dest: `./backups/${name}.sql`
            }, (err) => {
                console.error(err)
            })
        })
    } catch (error) {
        console.error(error)
    }
}

main();
