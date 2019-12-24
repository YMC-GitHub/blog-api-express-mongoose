// ================ frontend-user ================
// this is an api handle for frontend-user
// ================ frontend-user ================
// task:

//connect database
const mongoose = require('../mongoose')
//use data model User
const User = mongoose.model('User')
//include some commom function for api
const general = require('./general')
const { list, modify, deletes, recover } = general

const md5 = require('md5')
const moment = require('moment')
const jwt = require('jsonwebtoken')
const axios = require('axios')
const config = require('../config')
const md5Pre = config.md5Pre
const secret = config.secretClient
const mpappApiId = config.apiId
const mpappSecret = config.secret
const strlen = require('../utils').strlen


exports.getList = (req, res) => {
    list(req, res, User)
}

/**
 * R-user login
 * @method login
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.login = (req, res) => {
    let json = {}
    let { username } = req.body
    const { password } = req.body
    if (username === '' || password === '') {
        json = {
            code: -200,
            message: 'please input user name and password'
        }
        res.json(json)
    }
    User.findOneAsync({
        username,
        password: md5(md5Pre + password),
        is_delete: 0
    })
        .then(result => {
            if (result) {
                username = encodeURI(username)
                const id = result._id
                const remember_me = 2592000000
                const token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                res.cookie('user', token, { maxAge: remember_me })
                res.cookie('userid', id, { maxAge: remember_me })
                res.cookie('username', username, { maxAge: remember_me })
                json = {
                    code: 200,
                    message: 'login success',
                    data: token
                }
            } else {
                json = {
                    code: -200,
                    message: 'user name or password error误'
                }
            }
            res.json(json)
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * R-login with weixin
 * @method jscode2session
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.jscode2session = async (req, res) => {
    const { js_code } = req.body
    const xhr = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
        params: {
            appid: mpappApiId,
            secret: mpappSecret,
            js_code,
            grant_type: 'authorization_code'
        }
    })
    res.json({
        code: 200,
        message: 'login success',
        data: xhr.data
    })
}
/**
 * R/C-login with weixin
 * @method login
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.wxLogin = (req, res) => {
    let json = {}
    let id, token, username
    const { nickName, wxSignature, avatar } = req.body
    if (!nickName || !wxSignature) {
        json = {
            code: -200,
            message: 'args error, weixin login fails'
        }
        res.json(json)
    } else {
        User.findOneAsync({
            username: nickName,
            wx_signature: wxSignature,
            is_delete: 0
        })
            .then(result => {
                if (result) {
                    id = result._id
                    username = encodeURI(nickName)
                    token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                    json = {
                        code: 200,
                        message: 'login success',
                        data: {
                            user: token,
                            userid: id,
                            username
                        }
                    }
                    res.json(json)
                } else {
                    User.createAsync({
                        username: nickName,
                        password: '',
                        email: '',
                        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                        is_delete: 0,
                        timestamp: moment().format('X'),
                        wx_avatar: avatar,
                        wx_signature: wxSignature
                    })
                        .then(_result => {
                            id = _result._id
                            username = encodeURI(nickName)
                            token = jwt.sign({ id, username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                            res.json({
                                code: 200,
                                message: 'create success',
                                data: {
                                    user: token,
                                    userid: id,
                                    username
                                }
                            })
                        })
                        .catch(err => {
                            res.json({
                                code: -200,
                                message: err.toString()
                            })
                        })
                }
            })
            .catch(err => {
                res.json({
                    code: -200,
                    message: err.toString()
                })
            })
    }
}

/**
 * U-user logout
 * @method logout
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.logout = (req, res) => {
    res.cookie('user', '', { maxAge: -1 })
    res.cookie('userid', '', { maxAge: -1 })
    res.cookie('username', '', { maxAge: -1 })
    res.json({
        code: 200,
        message: 'logout success',
        data: ''
    })
}

/**
 * U-create user
 * @method insert
 * @param  {[type]}    req  [description]
 * @param  {[type]}    res  [description]
 * @param  {Function}  next [description]
 * @return {json}         [description]
 */
exports.insert = (req, res) => {
    const { email, password, username } = req.body
    if (!username || !password || !email) {
        res.json({
            code: -200,
            message: 'please fill on form first'
        })
    } else if (strlen(username) < 4) {
        res.json({
            code: -200,
            message: 'user at least require 2 chinese char  or 4 english char'
        })
    } else if (strlen(password) < 8) {
        res.json({
            code: -200,
            message: 'password at least require 8 char'
        })
    } else {
        User.findOneAsync({ username })
            .then(result => {
                if (result) {
                    res.json({
                        code: -200,
                        message: 'user name has been created'
                    })
                } else {
                    return User.createAsync({
                        username,
                        password: md5(md5Pre + password),
                        email,
                        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                        is_delete: 0,
                        timestamp: moment().format('X')
                    })
                        .then(() => {
                            res.json({
                                code: 200,
                                message: 'create success',
                                data: 'success'
                            })
                        })
                        .catch(err => {
                            res.json({
                                code: -200,
                                message: err.toString()
                            })
                        })
                }
            })
            .catch(err => {
                res.json({
                    code: -200,
                    message: err.toString()
                })
            })
    }
}

exports.getItem = (req, res) => {
    let json
    const userid = req.query.id || req.cookies.userid || req.headers.userid
    User.findOneAsync({
        _id: userid,
        is_delete: 0
    })
        .then(result => {
            if (result) {
                json = {
                    code: 200,
                    data: result
                }
            } else {
                json = {
                    code: -200,
                    message: 'please login first, or data error'
                }
            }
            res.json(json)
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * U-update user
 * @method modify
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.modify = (req, res) => {
    const { id, email, password, username } = req.body
    const data = {
        email,
        username,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    if (password) data.password = md5(md5Pre + password)
    modify(res, User, id, data)
}

/**
 * U-update account
 * @method account
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.account = (req, res) => {
    const { id, email } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    const username = req.body.username || req.headers.username
    if (user_id === id) {
        User.updateAsync({ _id: id }, { $set: { email, username } })
            .then(() => {
                res.json({
                    code: 200,
                    message: 'update success',
                    data: 'success'
                })
            })
            .catch(err => {
                res.json({
                    code: -200,
                    message: err.toString()
                })
            })
    } else {
        res.json({
            code: -200,
            message: 'without access right'
        })
    }
}

/**
 * U-update password
 * @method password
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.password = (req, res) => {
    const { id, old_password, password } = req.body
    const user_id = req.cookies.userid || req.headers.userid
    if (user_id === id) {
        User.findOneAsync({
            _id: id,
            password: md5(md5Pre + old_password),
            is_delete: 0
        }).then(result => {
            if (result) {
                User.updateAsync({ _id: id }, { $set: { password: md5(md5Pre + password) } })
                    .then(() => {
                        res.json({
                            code: 200,
                            message: 'update success',
                            data: 'success'
                        })
                    })
                    .catch(err => {
                        res.json({
                            code: -200,
                            message: err.toString()
                        })
                    })
            } else {
                res.json({
                    code: -200,
                    message: 'the origin password error'
                })
            }
        })
    } else {
        res.json({
            code: -200,
            message: 'without access right'
        })
    }
}

/**
 * D-delete user
 * @method deletes
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.deletes = (req, res) => {
    deletes(req, res, User)
}

/**
 * U-recover user
 * @method recover
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.recover = (req, res) => {
    recover(req, res, User)
}
