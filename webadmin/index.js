/*
 *  Github/TonyChG
 *  index.js
 *  Description:
**/

const express = require('express')
const app = express()
const config = require('config')
const { listAllDb, AdminDB } = require('./database')
const morgan = require('morgan')

app.use(express.static('./public'))
app.use(morgan('tiny'))

app.get('/databases', async (req, res) => {
    console.log(await listAllDb())
})

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server running on port ${process.env.SERVER_PORT}`)
})
