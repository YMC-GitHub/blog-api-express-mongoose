// ================ return ================
// this is a custom expres middleware return
// ================ return ================
// task:
// bind error,success function to ctx to uniform the return result
// and goto next middleware

module.exports = (req, res, next) => {
    //bind error function to ctx.res
    res.error = (message, data = '') => {
        res.body = {
            code: -200,
            message,
            data,
        }
    }
    //bind success function to ctx.res
    res.success = (data, message = '') => {
        res.body = {
            code: 200,
            message,
            data,
        }
    }
    //goto next middleware
    next()
}
