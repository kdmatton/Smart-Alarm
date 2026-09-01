const express = require('express')
const router = express.Router()
const authHandler = require('../handlers/auth')
const rateLimiter = require('../middleware/rateLimiter')
// router modules, these will be mounted in app.js

router.post('/register', authHandler.register)
router.post('/login', rateLimiter.loginLimit, authHandler.login)

module.exports = router