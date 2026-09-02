const express = require('express')
const router = express.Router()
const alarmHandler = require('../handlers/alarms')
const requireAuth = require('../middleware/auth')

// routes all go through requireAuth ... this basically checks if user has tokens in there session
// if access token expired on require auth, it will auto refresh, if fails then throws session expired
router.post('/create', requireAuth, alarmHandler.createAlarm)

module.exports = router
