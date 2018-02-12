/*
 *  Github/TonyChG
 *  index.js
 *  Description:
**/

const app = require('./app')
const http = require('http').Server(app)
const port = process.env.SERVER_PORT

http.listen(port, () => {
    console.log(`Server running on port ${port}`)
})

