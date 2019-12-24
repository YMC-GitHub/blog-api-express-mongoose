// ================ backend-article ================
// this is an api handle for backend-article
// ================ backend-article ================
// task:
// curd backend-article article
// make markdown to html with marked lib

//connect database
const mongoose = require('../mongoose')
//use data model Category,Article
const Article = mongoose.model('Article')
const Category = mongoose.model('Category')
//include some commom function for api
const general = require('./general')
const { list, item } = general

const moment = require('moment')
const marked = require('marked')
const hljs = require('highlight.js')
marked.setOptions({
    highlight(code) {
        return hljs.highlightAuto(code).value
    },
    breaks: true
})

/**
 * R-get article list
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getList = (req, res) => {
    list(req, res, Article, '-update_date')
}

/**
 * R-get an article
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.getItem = (req, res) => {
    item(req, res, Article)
}

/**
 * C-create an article
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.insert = (req, res) => {
    const { category, content, title } = req.body
    // make markdown to html with marked lib
    const html = marked(content)
    const arr_category = category.split('|')
    const data = {
        title,
        category: arr_category[0],
        category_name: arr_category[1],
        content,
        html,
        visit: 0,
        like: 0,
        comment_count: 0,
        creat_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        update_date: moment().format('YYYY-MM-DD HH:mm:ss'),
        is_delete: 0,
        timestamp: moment().format('X')
    }

    try {
        // create data to database with data model Article
        const result = await Article.createAsync(data)
        // update data to database with data model Category
        await Category.updateAsync({ _id: arr_category[0] }, { $inc: { cate_num: 1 } })
        res.json({
            code: 200,
            message: 'create success',
            data: result
        })
        //todo:uses res.success with custom middleware
        //so:
        //res.success(result, 'create success')
    } catch (err) {
        //todo:uses res.error with custom middleware
        //so:
        //res.error(err.toString())
        res.json({
            code: -200,
            message: err.toString()
        })
    }
    /*
    // create data to database with data model Article
    Article.createAsync(data)
        .then(result => {
            // update data to database with data model Category
            return Category.updateAsync({ _id: arr_category[0] }, { $inc: { cate_num: 1 } }).then(() => {
                return res.json({
                    code: 200,
                    message: 'create success',
                    data: result
                })
            })
        })
        .catch(err => {
            res.json({
                code: -200,
                message: err.toString()
            })
        })
    */
}

/**
 * D-delete article
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.deletes = (req, res) => {
    const _id = req.query.id
    Article.updateAsync({ _id }, { is_delete: 1 })
        .then(() => {
            return Category.updateAsync({ _id }, { $inc: { cate_num: -1 } }).then(result => {
                res.json({
                    code: 200,
                    message: 'update success',
                    data: result
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
 * U-recover article
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.recover = (req, res) => {
    const _id = req.query.id
    Article.updateAsync({ _id }, { is_delete: 0 })
        .then(() => {
            return Category.updateAsync({ _id }, { $inc: { cate_num: 1 } }).then(() => {
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

/**
 * U-update article
 * @method
 * @param  {[type]} req [description]
 * @param  {[type]} res [description]
 * @return {[type]}     [description]
 */
exports.modify = (req, res) => {
    const { id, category, category_old, content } = req.body
    const html = marked(content)
    const data = {
        title: req.body.title,
        category: req.body.category,
        category_name: req.body.category_name,
        content,
        html,
        update_date: moment().format('YYYY-MM-DD HH:mm:ss')
    }
    Article.findOneAndUpdateAsync({ _id: id }, data, { new: true })
        .then(result => {
            if (category !== category_old) {
                Promise.all([
                    Category.updateAsync({ _id: category }, { $inc: { cate_num: 1 } }),
                    Category.updateAsync({ _id: category_old }, { $inc: { cate_num: -1 } })
                ]).then(() => {
                    res.json({
                        code: 200,
                        message: 'update success',
                        data: result
                    })
                })
            } else {
                res.json({
                    code: 200,
                    message: 'update success',
                    data: result
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
