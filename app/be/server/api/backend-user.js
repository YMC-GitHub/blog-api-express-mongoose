// ================ backend-user ================
// this is an api handle for backend-user
// ================ backend-user ================
// task:
// curd backend-user admin
// sign username to token with jwt lib and some config
// encode password with md5 lib and some config
// encode username to base64 format
// bind some msg on cookies for the ctx

const md5 = require('md5')
const fs = require('fs')
const moment = require('moment')
const jwt = require('jsonwebtoken')

//connect database
const mongoose = require('../mongoose')
//use data model Admin
const Admin = mongoose.model('Admin')

const fsExistsSync = require('../utils').fsExistsSync
const config = require('../config')
const md5Pre = config.md5Pre
const secret = config.secretServer
//include some commom function for api
const general = require('./general')
const { list, item, modify, deletes, recover } = general

/**
 * R-get admin list
 * @method getList
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getList = (req, res) => {
    list(req, res, Admin)
}

/**
 * R-get an admin
 * @method getItem
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getItem = (req, res) => {
    item(req, res, Admin)
}

/**
 * R-admin login
 * @method loginAdmin
 * @param  {[type]}   req [description]
 * @param  {[type]}   res [description]
 * @return {[type]}       [description]
 */
exports.login = (req, res) => {
    let json = {}
    const { password, username } = req.body
    if (username === '' || password === '') {
        json = {
            code: -200,
            message: 'please input user name and password'
        }
        return res.json(json)
    }
    Admin.findOneAsync({
        username,
        password: md5(md5Pre + password),
        is_delete: 0
    })
        .then(result => {
            if (result) {
                const _username = encodeURI(username)
                const id = result._id
                const remember_me = 2592000000
                const token = jwt.sign({ id, username: _username }, secret, { expiresIn: 60 * 60 * 24 * 30 })
                res.cookie('b_user', token, { maxAge: remember_me })
                res.cookie('b_userid', id, { maxAge: remember_me })
                res.cookie('b_username', _username, { maxAge: remember_me })
                return res.json({
                    code: 200,
                    message: 'login success',
                    data: token
                })
            }
            return res.json({
                code: -200,
                message: 'user name or password error'
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}

/**
 * C-create admin when initing
 * @method insertAdmin
 * @param  {[type]}    req  [description]
 * @param  {[type]}    res  [description]
 * @param  {Function}  next [description]
 * @return {json}         [description]
 */
exports.insert = (req, res, next) => {
    const { email, password, username } = req.body
    if (fsExistsSync('./admin.lock')) {
        res.json({
            code: -200,
            message: 'fails',
            data: 'please delete admin.lock first'
        })
    }
    if (!username || !password || !email) {
        res.json({
            code: -200,
            message: 'fails',
            data: 'please fill on form first'
        })
    }
    Admin.findOneAsync({ username })
        .then(result => {
            if (result) {
                return 'the admin has been created'
            }
            return Admin.createAsync({
                username,
                password: md5(md5Pre + password),
                email,
                creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                is_delete: 0,
                timestamp: moment().format('X')
            }).then(() => {
                fs.writeFileSync('./admin.lock', username)
                return 'create admin success: ' + username + ', password: ' + password
            })
        })
        .then(message => {
            res.json({
                code: 200,
                message: 'success',
                data: message
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: 'fails',
                data: err.toString()
            })
        })
}
/*
exports.insert = (req, res, next) => {
    const { email, password, username } = req.body
    if (fsExistsSync('./admin.lock')) {
        return res.render('admin-add.ejs', { message: 'please delete admin.lock first' })
    }
    if (!username || !password || !email) {
        return res.render('admin-add.ejs', { message: 'please fill on form first' })
    }
    Admin.findOneAsync({ username })
        .then(result => {
            if (result) {
                return 'the admin has been created'
            }
            return Admin.createAsync({
                username,
                password: md5(md5Pre + password),
                email,
                creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                is_delete: 0,
                timestamp: moment().format('X')
            }).then(() => {
                fs.writeFileSync('./admin.lock', username)
                return 'create admin success: ' + username + ', password: ' + password
            })
        })
        .then(message => {
            res.render('admin-add.ejs', { message })
        })
        .catch(err => next(err))
}
*/
/**
 * U-update admin
 * @method modifyAdmin
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.modify = (req, res) => {
    const { id, email, password, username } = req.body
    var data = {
        email,
        username,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    if (password) data.password = md5(md5Pre + password)
    modify(res, Admin, id, data)
}

/**
 * D-delete admin
 * @method deletes
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.deletes = (req, res) => {
    deletes(req, res, Admin)
}

/**
 * U-recover admin
 * @method recover
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.recover = (req, res) => {
    recover(req, res, Admin)
}
