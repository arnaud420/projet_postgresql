/*
 *  Github/TonyChG
 *  index.js
 *  Description:
**/

// const config = require('config').database;
// const Backup = require('./modules/backup');

// const newBackup = new Backup({
//     host: '127.0.0.1',
//     user: 'root',
//     password: 'password',
// });

// console.log(newBackup.listDatabases())
// const knex = require('knex')(config)
const generate = require('./modules/generate')()

