/*
One place for the auth-cookie settings.

Both the login handler and the silent-refresh middleware set the accessToken
cookie, so the options live here to keep them identical - a mismatch (e.g. one
path missing `secure`) is the kind of bug that only shows up in production.
*/

// shared across both cookies
const baseCookieOpts = {
    httpOnly: true,                                 
    secure: process.env.NODE_ENV === 'production',  
    sameSite: 'strict',                           
}

// keep these in step with the JWT `expiresIn` values in services/auth.js
const ACCESS_TOKEN_MAX_AGE = 30 * 60 * 1000            // 30 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000  // 7 days

function setAccessCookie(res, token) {
    res.cookie('accessToken', token, { ...baseCookieOpts, maxAge: ACCESS_TOKEN_MAX_AGE })
}

function setRefreshCookie(res, token) {
    res.cookie('refreshToken', token, { ...baseCookieOpts, maxAge: REFRESH_TOKEN_MAX_AGE })
}

module.exports = { setAccessCookie, setRefreshCookie }
