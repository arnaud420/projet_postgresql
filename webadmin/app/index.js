/*
 *  Github/TonyChG
 *  index.js
 *  Description:
**/

const config = require('config')
const express = require('express')
const app = express()
const morgan = require('morgan')
const { Database } = require('../database')
const path = require('path')

app.use(express.static(__dirname + '/public'))
app.use(morgan('tiny'))

app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.get('/', async (req, res) => {
    const databases = await Database.list()

    res.render('index', { databases })
})

app.get('/database/:dbname', async (req, res) => {
    const db = new Database(req.params.dbname)
    const tables = await db.getTables()

    console.log(tables)

    res.render('list', { tables })
})

module.exports = app
