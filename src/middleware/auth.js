const jwt = require('jsonwebtoken')
const { refreshAccessToken } = require('../services/auth')
const { setAccessCookie } = require('../config/authCookies')

/*
we require auth for given routes
we also silent refresh if expired, utilise the function from services/auth
*/
async function requireAuth(req, res, next) {
    const { accessToken, refreshToken } = req.cookies || {}

    if (accessToken) {
        try {
            const payload = jwt.verify(accessToken, process.env.JWT_SECRET)
            req.user = { id: payload.id, email: payload.email }
            return next()
        } catch {
            // expired / malformed / bad signature - fall through to the refresh
            // token below, which is what actually decides whether to allow this
        }
    }

    // silent refresh access token
    let refreshed
    try {
        refreshed = await refreshAccessToken(refreshToken)
    } catch (err) {
        console.error('token refresh failed:', err)
        return res.status(500).json({ message: 'Something went wrong' })
    }

    // if no refresh token 
    if (!refreshed) {
        return res.status(401).json({ message: 'Session expired, please log in again' })
    }

    setAccessCookie(res, refreshed.accessToken)
    req.user = refreshed.user
    next()
}

module.exports = requireAuth
