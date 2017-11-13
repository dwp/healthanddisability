var express = require('express')
var router = express.Router()
var path = require('path')
var tog = require('../../../../lib/tog.js')

router.get('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1);
  next();
})

module.exports = router
