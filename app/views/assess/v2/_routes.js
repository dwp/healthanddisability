var express = require('express')
var router = express.Router()
var path = require('path')
var tog = require('../../../../lib/tog.js')

router.get('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.path1 = res.locals.path + "/" + bits[0]
  res.locals.path2 = res.locals.path + "/" + bits[0] + "/" + bits[1]
  res.locals.stage = req.cookies.stage || 1;
  next()
})

router.get('/miarussell/*', function (req, res, next) {
  res.locals.firstname = "Mia"
  next()
})

router.get('/cookies/', function (req, res, next) {
  res.send(tog(req.cookies));
})

module.exports = router
