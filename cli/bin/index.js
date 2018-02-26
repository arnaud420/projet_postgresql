/*
 *  Github/TonyChG
 *  index.js
 *  Description:
**/

const config = require('config').database;
const knex = require('knex')(config);

const generate = require('./modules/generate')(knex)

generate()
