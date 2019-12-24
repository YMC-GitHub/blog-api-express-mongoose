// ================ user ================
// this is a custom express middleware user
// ================ user ================
// task:
// check if user is user:
// 01.need to login first
// 02.need to check the user
// if true,goto next middleware

const jwt = require('jsonwebtoken')
const config = require('../config')
const secret = config.secretClient

module.exports = (req, res, next) => {
    const token = req.cookies.user || req.headers.user
    const userid = req.cookies.userid || req.headers.userid
    const username = req.cookies.username || req.headers.username
    if (token) {
        jwt.verify(token, secret, function (err, decoded) {
            if (
                !err &&
                decoded.id === userid &&
                (decoded.username === username || decoded.username === encodeURI(username))
            ) {
                req.decoded = decoded
                next()
            } else {
                res.cookie('user', '', { maxAge: 0 })
                res.cookie('userid', '', { maxAge: 0 })
                res.cookie('username', '', { maxAge: 0 })
                return res.json({
                    code: -400,
                    message: 'login fails',
                    data: '',
                })
            }
        })
    } else {
        return res.json({
            code: -400,
            message: 'need to login first',
            data: '',
        })
    }
}
