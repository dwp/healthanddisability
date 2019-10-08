



const express = require('express')
const router = express.Router()
var path = require('path')
var moment = require('moment')
var tog = require('../../../../lib/tog.js')
var request = require('request')
var calendar = require('node-calendar')
var moment = require('moment')
const crypto = require('crypto')

var filePath = '../../../../app/views/fha/appointment-scenarios' 
var viewPath = 'fha/appointment-scenarios'




router.get('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.path1 = res.locals.path + '/' + bits[0]
  res.locals.path2 = res.locals.path + '/' + bits[0] + '/' + bits[1]
  res.locals.stage = 1

  res.locals.cssPath = '/public/stylesheets/fha_v9.css'
  res.locals.javascriptPath = '/public/javascripts/application_v9.js'

  router.get('/cookies/', function (req, res, next) {
    res.send(tog(req.cookies))
  })

  next()
})




  

  /*
  Clears session (triggered by little link at bottom of pages)
*/
router.get('/clearSession', function (req, res, next) {
  req.session.data.nuggets = []
  req.session.data.withdesc = false
  req.session.data.physexam = false
  req.session.data = {}
  nug_id = 0
  res.send('success')
  next()
})
 


  var appointmentCustomers = require(filePath + '/data/appointments.js')

  router.get('/', function (req, res, next) {
    res.locals.appointmentNumbers = {
      total: appointmentCustomers.length,
      readyToBook: appointmentCustomers.filter(customer => customer.status === 'Ready to book').length,
      booked: appointmentCustomers.filter(customer => customer.status === 'Booked').length,
      didNotAttend: appointmentCustomers.filter(customer => customer.status === 'Did not attend').length
    }
    next()
  }) 

router.get('/scenario4/caselist', function (req, res, next) {
  res.locals.customers = appointmentCustomers
  next()
})


router.get('/scenario4/booked', function (req, res, next) {
  res.locals.customers = appointmentCustomers
  .filter(customer => customer.status === "Booked");
  next()
})




module.exports = router
