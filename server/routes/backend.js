
// ================ backend ================
// this is for backend
// ================ backend ================

// inclue route engine for express framework
const express = require('express')
const router = express.Router()
const multipart = require('connect-multiparty')
const multipartMiddleware = multipart()

// inclue some api files
const backendArticle = require('../api/backend-article')
const backendCategory = require('../api/backend-category')
const backendUser = require('../api/backend-user')
const frontendComment = require('../api/frontend-comment')
const frontendUser = require('../api/frontend-user')
const isAdmin = require('../middlewares/admin')

//bind url path to handle files
// ------- article -------
router.get('/article/list', isAdmin, backendArticle.getList)
router.get('/article/item', isAdmin, backendArticle.getItem)
router.post('/article/insert', isAdmin, multipartMiddleware, backendArticle.insert)
router.get('/article/delete', isAdmin, backendArticle.deletes)
router.get('/article/recover', isAdmin, backendArticle.recover)
router.post('/article/modify', isAdmin, multipartMiddleware, backendArticle.modify)
// ------- category -------
router.get('/category/list', backendCategory.getList)
router.get('/category/item', backendCategory.getItem)
router.post('/category/insert', isAdmin, multipartMiddleware, backendCategory.insert)
router.get('/category/delete', isAdmin, backendCategory.deletes)
router.get('/category/recover', isAdmin, backendCategory.recover)
router.post('/category/modify', isAdmin, multipartMiddleware, backendCategory.modify)
// ------- admin -------
router.post('/admin/insert', multipartMiddleware, backendUser.insert)
router.post('/admin/login', multipartMiddleware, backendUser.login)
router.get('/admin/list', isAdmin, backendUser.getList)
router.get('/admin/item', isAdmin, backendUser.getItem)
router.post('/admin/modify', isAdmin, multipartMiddleware, backendUser.modify)
router.get('/admin/delete', isAdmin, backendUser.deletes)
router.get('/admin/recover', isAdmin, backendUser.recover)
// ------- user -------
router.get('/user/list', isAdmin, frontendUser.getList)
router.get('/user/item', isAdmin, frontendUser.getItem)
router.post('/user/modify', isAdmin, multipartMiddleware, frontendUser.modify)
router.get('/user/delete', isAdmin, frontendUser.deletes)
router.get('/user/recover', isAdmin, frontendUser.recover)
// ------ comment ------
router.get('/comment/delete', isAdmin, frontendComment.deletes)
router.get('/comment/recover', isAdmin, frontendComment.recover)

module.exports = router
