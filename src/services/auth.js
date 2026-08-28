const db = require('../config/db')
const bcrypt = require('bcrypt')

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

    // if pass both checks
    return { userid: user.userid, email: user.email }
}

module.exports = { register,login }
