// ================ index ================
// this is route index file
// ================ index ================

// inclue route engine for express framework
const express = require('express')
const router = express.Router()

// inclue some route file
const backend = require('./backend')
const frontend = require('./frontend')

// 添加管理员
router.get('/backend', (req, res) => {
    res.render('admin-add.html', { title: '添加管理员', message: '' })
})
router.post('/backend', (req, res) => {
    backendUser.insert(req, res)
})

// route for api
router.use('/api/backend', backend)
router.use('/api/frontend', frontend)

// route for other
router.get('*', (req, res) => {
    res.json({
        code: -200,
        message: 'Not Found'
    })
})

module.exports = router
