const db = require('../config/db')
const crypto = require('crypto')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const SALT_ROUNDS = 10

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

    // get user and email for payload
    const userId = user.userid
    const userEmail = user.email
    
    // access token
    const accessToken = jwt.sign(
        {id: userId,email: userEmail},
        process.env.JWT_SECRET,
        {expiresIn: '30m'}
    )
    // refresh token
    const refreshToken = jwt.sign(
        {id: userId},
        process.env.JWT_SECRET,
        {expiresIn: '7d'}
    )
   
    const hashedRefreshToken = crypto.createHash('sha256').update(refreshToken).digest('hex')

    // re writes existing 
    await db.query(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '7 days')
         ON CONFLICT (user_id)
         DO UPDATE SET token_hash = EXCLUDED.token_hash,
                       expires_at = EXCLUDED.expires_at,
                       created_at = NOW(),
                       revoked    = FALSE`,
        [userId, hashedRefreshToken]
    );
    return { accessToken, refreshToken }
}

module.exports = { register,login }
