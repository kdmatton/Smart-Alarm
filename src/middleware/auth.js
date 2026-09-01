const jwt = require('jsonwebtoken')
const { refreshAccessToken } = require('../services/auth')
const { setAccessCookie } = require('../config/authCookies')

/*
requireAuth - gate for protected routes.

  1. access token valid              -> attach req.user, continue
  2. access token missing/expired/bad -> try the refresh token; if it checks out,
                                        set a new access-token cookie and continue
  3. refresh token also no good      -> 401

The refresh happens here rather than through a separate /auth/refresh call, so
the client never has to notice a token expired - it just keeps making requests
and the middleware quietly tops up the access token.
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
