var express = require('express')
var router = express.Router()
var path = require('path')

router.get('*', function (req, res, next) {
  if (req.params[0].substr(-1) == '/') res.locals.path = req.params[0].slice(0,-1).substr(1);
  else res.locals.path = path.dirname(req.params[0]).substr(1);
  next();
})

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// add your routes here

module.exports = router
