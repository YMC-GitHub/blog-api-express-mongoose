// ================ frontend-comment ================
// this is an api handle for frontend-comment
// ================ frontend-comment ================
// task:

const moment = require('moment')
//connect database
const mongoose = require('../mongoose')
//use data model Comment,Article
const Comment = mongoose.model('Comment')
const Article = mongoose.model('Article')

/**
 * C-create comment
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.insert = (req, res) => {
    const { id, content } = req.body
    const avatar = req.body.avatar || ''
    const creat_date = moment().format('YYYY-MM-DD HH:mm:ss')
    const timestamp = moment().format('X')
    const userid = req.cookies.userid || req.headers.userid
    let username = req.cookies.username || req.headers.username
    username = decodeURI(username)
    if (!id) {
        res.json({ code: -200, message: 'args error' })
        return
    } else if (!content) {
        res.json({ code: -200, message: 'please input comment content' })
        return
    }
    var data = {
        article_id: id,
        avatar,
        userid,
        username,
        email: '',
        content,
        creat_date,
        is_delete: 0,
        timestamp
    }
    Comment.createAsync(data)
        .then(result => {
            return Article.updateAsync(
                {
                    _id: id
                },
                {
                    $inc: {
                        comment_count: 1
                    }
                }
            ).then(() => {
                res.json({
                    code: 200,
                    data: result,
                    message: 'create success'
                })
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
 * R-get comment list
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getList = (req, res) => {
    const { all, id } = req.query
    let { limit, page } = req.query
    if (!id) {
        res.json({
            code: -200,
            message: 'args error'
        })
    } else {
        page = parseInt(page, 10)
        limit = parseInt(limit, 10)
        if (!page) page = 1
        if (!limit) limit = 10
        const data = {
            article_id: id
        },
            skip = (page - 1) * limit
        if (!all) {
            data.is_delete = 0
        }
        Promise.all([
            Comment.find(data)
                .sort('-_id')
                .skip(skip)
                .limit(limit)
                .exec(),
            Comment.countAsync(data)
        ])
            .then(result => {
                const total = result[1]
                const totalPage = Math.ceil(total / limit)
                const json = {
                    code: 200,
                    data: {
                        list: result[0],
                        total,
                        hasNext: totalPage > page ? 1 : 0
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
}

/**
 * D-delete comment
 * @method deleteAdmin
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.deletes = (req, res) => {
    const _id = req.query.id
    Comment.updateAsync({ _id }, { is_delete: 1 })
        .then(() => {
            return Article.updateAsync({ _id }, { $inc: { comment_count: -1 } }).then(() => {
                res.json({
                    code: 200,
                    message: 'delete success',
                    data: 'success'
                })
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
 * U-update comment
 * @method deleteAdmin
 * @param  {[type]}    req [description]
 * @param  {[type]}    res [description]
 * @return {[type]}        [description]
 */
exports.recover = (req, res) => {
    const _id = req.query.id
    Comment.updateAsync({ _id }, { is_delete: 0 })
        .then(() => {
            return Article.updateAsync({ _id }, { $inc: { comment_count: 1 } }).then(() => {
                res.json({
                    code: 200,
                    message: 'update success',
                    data: 'success'
                })
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
}
