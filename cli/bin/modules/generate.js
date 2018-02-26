/*
 *  Github/TonyChG
 *  generate.js
 *  Description:
**/

const path = require('path');
const importer = require('node-mysql-importer');

module.exports = () => {
    const sql = path.join(__dirname, '../../seeds/users.sql');

    importer.config({
            'host': '127.0.0.1',
            'user': 'root',
            'password': 'password',
            'database': 'test'
    })

    importer.importSQL(sql).then(() => {
        console.log('All statements executed.');
    }).catch(error => {
        console.error(error)
    })
}
