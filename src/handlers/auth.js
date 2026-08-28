// this imports files froms services, allowing us to actually utilize the functions
const authenticate = require('../services/auth')

// this is for regex for email and password, determmines if email and password is valid
const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

/*
Login in to user account
Flow : we should be validating email, pass --> attach a refresh token to the new user in db (note that the refresh token will be revokes after logout)
*/
const register = async (req,res) => {
    const {email, password} = req.body

    // this will test if the email and password pass the regex
    if (!regexEmail.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!regexPassword.test(password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character' });
    }

    try {
        const user = await authenticate.register(email, password);
        return res.status(201).json({message: 'User created' });
    } catch (err) {
        if (err.code === 'EMAIL_TAKEN') {
            return res.status(409).json({ message: err.message });
        }
        console.error('register failed:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

/* 
Register an account
Flow : Attatch a new refresh token --> attacth a access token 
*/
const login = async (req,res) => {
    const {email, password} = req.body

    // this will test if the email and password pass the regex
    if (!regexEmail.test(email)) {
        return res.status(400).json({ message: 'Invalid username' });
    }
    if (!regexPassword.test(password)) {
        return res.status(400).json({ message: 'Invalid Password' });
    }
    }
    try{

    } catch (err){

    }

module.exports = { login, register };