const express = require('express')
const router = express.Router()
const requireAuth = require('../middleware/auth')

// example protected route: requireAuth verifies the access token (silently
// refreshing it if needed) and puts the account on req.user
router.get('/me', requireAuth, (req, res) => {
    res.json({ user: req.user })
})

module.exports = router
