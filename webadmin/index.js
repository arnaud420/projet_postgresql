/*
 *  Github/TonyChG
 *  index.js
 *  Description:
**/

const express = require('express')
const app = express()
const config = require('config')
const client = require('./database')

app.get('/', async (req, res) => {
})

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running on port ${process.env.SERVER_PORT}`)
})
