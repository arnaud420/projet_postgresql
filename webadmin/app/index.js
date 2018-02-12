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

app.use(morgan('tiny'))
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

app.get('/', async (req, res) => {
    const databases = await Database.list()

    res.render('index', { databases })
})

module.exports = app
