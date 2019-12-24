// ================ index ================
// this is route index file
// ================ index ================

// inclue route engine for express framework
const express = require('express')
const router = express.Router()

// inclue some route file
const backend = require('./backend')
const frontend = require('./frontend')

const bindApp = function (app) {
    /*
    router.get('/backend', (req, res) => {
        res.render('admin-add.ejs', { title: 'add admin', message: '' })
    })
    router.post('/backend', (req, res) => {
        backendUser.insert(req, res)
    })
    */
    // route for api
    app.use('/api/backend', backend)
    app.use('/api/frontend', frontend)

    // route for other
    app.get('*', (req, res) => {
        res.json({
            code: -200,
            message: 'Not Found'
        })
    })
}

module.exports = bindApp
