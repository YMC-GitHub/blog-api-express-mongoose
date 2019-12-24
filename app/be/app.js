// ================ backend index ================
// this is the app index file for backend
// ================ backend index================
//task:
var express = require('express')
var compression = require('compression')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

//include some data model files
require('./server/models/admin')
require('./server/models/article')
require('./server/models/category')
require('./server/models/comment')
require('./server/models/user')

//include some route files
var bindRouteToApp = require('./server/routes/index')

var app = express()
//use some express middlewares
app.use(compression())
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// for static serve in public path
app.use(express.static(path.join(__dirname, 'public')))
// for static web serve in views path
app.set('views', path.join(__dirname, 'views'))
app.engine('.ejs', require('ejs').__express)
app.set('view engine', 'ejs')
app.use(favicon(path.join(__dirname, 'views') + '/favicon.ico'))
bindRouteToApp(app)

//handle err
app.use(function (err, req, res) {
    //console.error('server error', err, req, res)
    //console.error('server error', err)
    console.error('server error', err.stack)
    //send err to fe with html format
    /*
    res.status(err.status || 500)
    res.send(err.message)
    */
    //send err to fe with json format
    /*
     res.json({
         code: -200,
         message: 'err.message'
     })
     */
})

module.exports = app
