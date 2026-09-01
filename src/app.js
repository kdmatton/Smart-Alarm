const express = require('express')
const cookieParser = require('cookie-parser')

// we initilize an instance of express server as app
const app = express()
const port = 8000

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// route mount, this essentially acts as the top level of routes, and the routes directory contains 
// route modules which we just mount on top of the top level routes which are below 
app.use('/', require('./routes/user'))
app.use('/auth', require('./routes/auth'))

// starts the server
app.listen(port, () => {
    console.log(`running on port http://localhost:${port}/`)
})