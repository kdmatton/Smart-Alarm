const db = require('../config/db')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = 10
const ACCESS_TOKEN_TTL = '30m'
const REFRESH_TOKEN_TTL = '7d'

/*
Register User account
*/
async function register(email, password) {
    // hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    // attempts to add into db and if err occurs we catch and throw err
    try {
        const result = await db.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING userid, email',
            [email, hashedPassword]
        )
        return result.rows[0]
    } catch (err) {
        // 23505 is a code when there is already duplicate
        if (err.code === '23505') {
            const takenError = new Error('Email already registered')
            takenError.code = 'EMAIL_TAKEN'
            throw takenError
        }
        // throw err code that may happen
        throw err
    }
}

/* --- token helpers ------------------------------------------------------- */

// access token: carries id + email, short lived, sent on every request
function signAccessToken({ id, email }) {
    return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL })
}

// refresh token: carries only id, long lived, only used to mint access tokens
function signRefreshToken({ id }) {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: REFRESH_TOKEN_TTL })
}

// we persist only a hash of the refresh token - same reasoning as password hashing
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

// constant-time compare so response timing can't be used to guess the stored hash
function tokenHashMatches(token, storedHash) {
    const a = Buffer.from(hashToken(token), 'hex')
    const b = Buffer.from(storedHash, 'hex')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
}


async function login (email, password) {
    const result = await db.query(
        'SELECT userid, email, password FROM users WHERE email = $1', [email]
    )

    // no user with that email
    const user = result.rows[0]
    if (!user) return null

    // wrong password
    const match = await bcrypt.compare(password, user.password)
    if (!match) return null

    const account = { id: user.userid, email: user.email }
    const accessToken = signAccessToken(account)
    const refreshToken = signRefreshToken(account)

    // store the hash - one row per user, logging in again overwrites it
    await db.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')
         ON CONFLICT (user_id)
         DO UPDATE SET token_hash = EXCLUDED.token_hash,
                       expires_at = EXCLUDED.expires_at,
                       created_at = NOW(),
                       revoked    = FALSE`,
        [account.id, hashToken(refreshToken)]
    );

    return { accessToken, refreshToken }
}

/*
Silent refresh.
Given the refresh token from the request cookie we recreate an access token
*/
async function refreshAccessToken(refreshToken) {
    // session expired user has to sign in again
    if (!refreshToken) return null

    // if user has a refresh token then we verify it with the signarture
    let payload
    try {
        payload = jwt.verify(refreshToken, process.env.JWT_SECRET)
    } catch {
        return null
    }

    // after we verify the signature we then check the refreshh token in db to see if it exists
    const { rows } = await db.query(
        `SELECT rt.token_hash, rt.revoked, rt.expires_at, u.email
         FROM refresh_tokens rt
         JOIN users u ON u.userid = rt.user_id
         WHERE rt.user_id = $1`,
        [payload.id]
    )
    // these are all checks to see if refresh token exists
    const row = rows[0]
    if (!row) return null
    if (row.revoked) return null
    if (new Date(row.expires_at) < new Date()) return null
    if (!tokenHashMatches(refreshToken, row.token_hash)) return null

    // return new access token
    const account = { id: payload.id, email: row.email } // set the email and set the user id
    return { accessToken: signAccessToken(account), user: account } // 
}

module.exports = { register, login, refreshAccessToken }
