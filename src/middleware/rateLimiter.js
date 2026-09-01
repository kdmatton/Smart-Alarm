const ratelimit = require('express-rate-limit')

/* 
Login Rate Limiter (this will be IP based)
*/
const loginLimit = ratelimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: "Too many requests, Try again in 5 minutes"
})

module.exports = {loginLimit}