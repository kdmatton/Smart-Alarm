const db = require('../config/db')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10

/*
Register User account
*/
async function register(email, password) {
    // hash password 
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

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
        throw err
    }
}

module.exports = { register }
