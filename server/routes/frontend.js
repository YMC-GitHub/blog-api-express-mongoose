// ================ frontend ================
// this is for frontend
// ================ frontend ================

// inclue route engine for koa framework
const express = require('express')
const router = express.Router()
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()

// inclue some api files
const frontendArticle = require('../api/frontend-article')
const frontendComment = require('../api/frontend-comment')
const frontendLike = require('../api/frontend-like')
const frontendUser = require('../api/frontend-user')
const isUser = require('../middlewares/user')

// ================= frontend =================
// ------ article ------
// R-get article list
router.get('/article/list', frontendArticle.getList)
// R-get an article
router.get('/article/item', frontendArticle.getItem)
// R-get hot article
//router.get('/trending', frontendArticle.getTrending)
// ------ comment ------
router.post('/comment/insert', isUser, multipartMiddleware, frontendComment.insert)
router.get('/comment/list', frontendComment.getList)
// ------ user ------
router.post('/user/insert', multipartMiddleware, frontendUser.insert)
router.post('/user/login', multipartMiddleware, frontendUser.login)
router.post('/user/jscode2session', multipartMiddleware, frontendUser.jscode2session)
router.post('/user/wxLogin', multipartMiddleware, frontendUser.wxLogin)
router.post('/user/logout', isUser, frontendUser.logout)
router.get('/user/account', isUser, frontendUser.getItem)
router.post('/user/account', isUser, multipartMiddleware, frontendUser.account)
router.post('/user/password', isUser, multipartMiddleware, frontendUser.password)
// ------ like ------
router.get('/like', isUser, frontendLike.like)
router.get('/unlike', isUser, frontendLike.unlike)
router.get('/reset/like', isUser, frontendLike.resetLike)


module.exports = router
