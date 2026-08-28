// this imports files froms services, allowing us to actually utilize the functions
const authenticate = require('../services/auth')

// this is for regex for email and password, determmines if email and password is valid
const regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

/*
Register an account
Flow : validate email + password format --> create the user in the db (password is hashed in the service)
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
Login to a user account
Flow : validate email + that a password was sent --> check credentials against the db
       (token will be added here later)
*/
const login = async (req,res) => {
    const {email, password} = req.body

    // basic input checks (we don't enforce the password regex on login,
    // just make sure something was sent)
    if (!regexEmail.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!password || password.length < 1) {
        return res.status(400).json({ message: 'Enter a password' });
    }

    try {
        const user = await authenticate.login(email, password);
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        return res.status(200).json({ message: 'Login Success' });
        
    } catch (err) {
        console.error('login failed:', err);
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

module.exports = { login, register };