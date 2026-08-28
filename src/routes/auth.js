const express = require('express')
const router = express.Router()
const authHandler = require('../handlers/auth')
// router modules, these will be mounted in app.js

router.post('/register', authHandler.register)
router.post('/login', authHandler.login)

module.exports = router