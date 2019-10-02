var express = require('express')
var router = express.Router()
var path = require('path')
var moment = require('moment')
var tog = require('../../../../lib/tog.js')
var request = require('request')
var calendar = require('node-calendar')
var moment = require('moment')
const crypto = require('crypto')

const radioButtonRedirect = require('radio-button-redirect')
router.use(radioButtonRedirect)
router.use(function(req, res, next){
  if(req.method === 'post' || req.method === 'POST'){
    console.log('the path posted to is');
    console.log(req.path);
  }else{
    console.log('the get path is');
    console.log(req.path);
  }
  next();
})
var versionNumber = '8'
var filePath = '../../../../app/views/fha/v' + versionNumber
var viewPath = 'fha/v' + versionNumber

var staffDataHoliday = require(filePath + '/data/staff-data-holiday.js')
var staffData2 = require(filePath + '/data/staff-data-2.js')
var slotsData = require(filePath + '/data/slots-data.js')
var slotsData2 = require(filePath + '/data/slots-data-2.js')
var commentsData = require(filePath + '/data/comments.js')
var appointmentHistory = require(filePath + '/data/appointmentHistory.js')

router.get('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.path1 = res.locals.path + '/' + bits[0]
  res.locals.path2 = res.locals.path + '/' + bits[0] + '/' + bits[1]
  res.locals.stage = 1

  res.locals.cssPath = '/public/stylesheets/fha_v8.css'
  res.locals.javascriptPath = '/public/javascripts/application_v9.js'
  res.locals.versionNumber = versionNumber

  if (!req.session.data.socialWorkComments) {
    req.session.data.socialWorkComments = []
  }

  if (!req.session.data.typicalDayComments) {
    req.session.data.typicalDayComments = []
  }
  if (!req.session.data.observedBehaviourComments) {
    req.session.data.observedBehaviourComments = []
  }

  if (!req.session.data.observations) {
    req.session.data.observations = []
  }

  res.locals.menuItems = require(filePath +'/caselist/_navItems.js')(versionNumber, reviewCustomers, assessmentCustomers, appointmentCustomers );
  res.locals.menuItemsDm = require(filePath +'/caselist/_navItemsDM.js')(versionNumber, dmCustomers );

  next()
})

router.get('/scenario_02a/wca-index', (req, res, next) => {
  res.locals.assessmentStartTime = req.session.assessmentStartTime;
  next();
})

router.post('/scenario_02a/wca-index', (req, res, next) => {
  if(req.body['startFTFtrigger'] === 'Start face-to-face'){
    req.session.assessmentStartTime = moment(new Date(), 'hh:mm:ss a');
  }
  
  next();
});

router.get('/scenario_02a/wca-index', (req, res, next) => {
  res.locals.assessmentFinishTime = req.session.assessmentFinishTime;
  next();
})

router.post('/scenario_02a/wca-index', (req, res, next) => {
  if(req.body['endFTFtrigger'] === 'Finish face-to-face'){
    req.session.assessmentFinishTime = moment(new Date(), 'hh:mm:ss a');
  }
  
  next();
});


router.get('/', function (req, res, next) {
  res.locals.reviewNumbers = {
    total: reviewCustomers.length,
    readyForReview: reviewCustomers.filter(customer => customer.status === 'review').length,
    fme: reviewCustomers.filter(customer => customer.status === 'fme').length
  }
  next()
})

router.get('/', function (req, res, next) {
  res.locals.appointmentNumbers = {
    total: appointmentCustomers.length,
    readyToBook: appointmentCustomers.filter(customer => customer.status === 'Ready to book').length,
    booked: appointmentCustomers.filter(customer => customer.status === 'Booked').length,
    didNotAttend: appointmentCustomers.filter(customer => customer.status === 'Did not attend').length
  }
  next()
})

router.get('/', function (req, res, next) {
  res.locals.assessNumbers = {
    total: assessmentCustomers.length,
    readyForAssessment: assessmentCustomers.filter(customer => customer.status === 'Ready for assessment').length,
    assesmentComplete: assessmentCustomers.filter(customer => customer.status === 'Assessment completed').length,
    assesmentStopped: assessmentCustomers.filter(customer => customer.status === 'Assessment stopped').length,
    appointmentToday: assessmentCustomers.filter(customer => customer.status === 'Appointment today').length,
    readyToBook: assessmentCustomers.filter(customer => customer.status === 'Ready to book').length,
    booked: assessmentCustomers.filter(customer => customer.status === 'Booked').length

  }
  next()
})

router.get('/', function (req, res, next) {
  res.locals.dmNumbers = {
    total: dmCustomers.length,
    assessmentReports: dmCustomers.filter(customer => customer.status === 'Assessment reports').length,
    failedToAttend: dmCustomers.filter(customer => customer.status === 'Failed to attend appointment').length,
    questionnaireNotReturned: dmCustomers.filter(customer => customer.status === 'Questionnaire not returned').length

  }
  next()
})

router.post('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.path1 = res.locals.path + '/' + bits[0]
  res.locals.path2 = res.locals.path + '/' + bits[0] + '/' + bits[1]
  res.locals.stage = 1

  res.locals.cssPath = '/public/stylesheets/fha_v8.css'
  res.locals.javascriptPath = '/public/javascripts/application_v9.js'
  res.locals.versionNumber = versionNumber

  if (!req.session.data.socialWorkComments) {
    req.session.data.socialWorkComments = []
  }

  if (!req.session.data.typicalDayComments) {
    req.session.data.typicalDayComments = []
  }

  if (!req.session.data.observedBehaviourComments) {
    req.session.data.observedBehaviourComments = []
  }

  if (!req.session.data.conditionComments) {
    req.session.data.conditionComments = []
  }

  if (!req.session.data.observations) {
    req.session.data.observations = []
  }

  res.locals.menuItems = require(filePath + '/caselist/_navItems.js')(versionNumber, reviewCustomers, assessmentCustomers, appointmentCustomers);
  res.locals.menuItemsDm = require(filePath +'/caselist/_navItemsDM.js')(versionNumber, dmCustomers );

  next()
})

router.get('/miarussell/*', function (req, res, next) {
  res.locals.firstname = 'Mia'
  next()
})

router.get('/victorcastillo/*', function (req, res, next) {
  res.locals.firstname = 'Victor'
  next()
})

router.get('/cookies/', function (req, res, next) {
  res.send(tog(req.cookies))
})

router.get('*/record_phys_exam', function (req, res, next) {
  req.session.data.physexam = true
  // res.send(tog(req.session.data));
  // res.send(tog(req.params[0]));
  res.redirect('/' + res.locals.path + '/victorcastillo/evidence/finish')
})

var nug_id = 0

/*
  Used to save indiviudal "nuggets" of evidence from the add evidence screen
*/
router.post('/saveText/', function (req, res, next) {
  var newNugget = {
    'text': req.body.nugget,
    'id': nug_id++,
    'time': new Date()
  }
  req.session.data.nuggets = req.session.data.nuggets ? req.session.data.nuggets : []
  req.session.data.nuggets.push(newNugget)
  res.send(tog(req.session.data))
})

/*
  Clears session (triggered by little link at bottom of pages)
*/
router.get('/clearSession', function (req, res, next) {
  req.session.data.nuggets = []
  req.session.data.withdesc = false
  req.session.data.physexam = false
  req.session.data = {}
  observations = []
  req.session.data.socialWorkComments = []
  req.session.data.typicalDayComments = []
  req.session.data.observedBehaviourComments = []
  req.session.data.conditionComments = []
  nug_id = 0
  res.send('success')
})

router.post('/updateEvidence', function (req, res, next) {
  var id = req.body.id
  var nug = _.find(req.session.data.nuggets, {'id': parseInt(id)})
  nug.descriptors = req.body.descriptors
  req.session.data.withdesc = true
  res.send(tog(req.session.data.nuggets))
})

router.get('/prefillAssessment', function (req, res, next) {
  req.session.data.nuggets = []
  var bits = [
    'The client experiences nausea as a result of their pain medication',
    "He says he used to sleep a lot but isn't doing that so much anymore",
    'Broke his right leg in Aug 2015 following a motorbike accident. He fractured the whole of his leg. He had surgery and has 2 bolts in his knee to hold his knee together. He also has an external fixator on his right let from his knee down. Had been to physiotherapy twice but has been told there is only so much that they can do until his leg is healed.',
    "Some days he can't to the exercises at all due to pain",
    'They have given him basic leg exercises to do at home to help build his calf muscle. He has a lot of muscle wasting in his right thigh and says the exercises are helping a bit',
    'Has an appointment with the surgeon today and is getting hospital transport there',
    'Is seeign his surgeon regularly for review of his leg and to adjust his fixator, seeing him every couple of weeks and having the fixator adjusted every week',
    "His specialist has advised that it will be about 4 months before he will heal and the cage will be removed. Has had the cage on for 6 weeks now. He says at first he couldn't do anything and was housebound. Now he is able to do more with the use of 2 crutches. Can weight bare a little bit now on his right leg",
    'Used to take morphine for pain but is not taking this anymore as his pain is improving'
  ]
  var time = moment(new Date())
  for (var i = bits.length - 1; i > -1; i--) {
    // console.log(time)
    var newNugget = {
      'text': bits[i],
      'id': i,
      'time': moment(time)
    }
    // console.log(newNugget)
    req.session.data.nuggets.push(newNugget)
    time.subtract(3, 'minutes')
  }
  nug_id = bits.length
  req.session.data.physexam = true
  res.send('success')
})

var arrivedTime = ''

var getAppointmentDates = function () {
  var appointments = {}

  appointments.nextAvailable = moment().add(15, 'days').hours(11).minutes(0)
  appointments.today = moment().hours(14).minutes(0)

  return appointments
}

router.get('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.root = '/fha/v' + versionNumber
  res.locals.manageStaffPath = viewPath + '/capacity/manage-staff'
  res.locals.path1 = res.locals.path + '/' + bits[0]
  res.locals.path2 = res.locals.path + '/' + bits[0] + '/' + bits[1]
  res.locals.stage = req.cookies.stage || 1
  res.locals.query = req.query
  res.locals.arrivedTime = arrivedTime

  // res.locals.staff = staffData;
  res.locals.appointments = getAppointmentDates()

  for (property in req.session.data) {
    res.locals[property] = req.session.data[property]
  }

  next()
})

router.post('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.root = '/fha/v' + versionNumber
  res.locals.manageStaffPath = viewPath + '/capacity/manage-staff'
  res.locals.path1 = res.locals.path + '/' + bits[0]
  res.locals.path2 = res.locals.path + '/' + bits[0] + '/' + bits[1]
  res.locals.stage = req.cookies.stage || 1
  res.locals.query = req.query
  res.locals.arrivedTime = arrivedTime

  // res.locals.staff = staffData;
  next()
})

router.get('/booking/mendez*', function (req, res, next) {

})
router.post('/booking/cancel-appointment', function (req, res, next) {
  if (req.body.change_now === 'true') {
    res.redirect('timepicker')
  } else {
    res.redirect('/fha/v' + versionNumber + '/appointments-changed?reason=' + req.body.reason)
  }
})

function getCentreDetails (req, res) {
  var centres = require(filePath + '/data/centres.js'),
    centreId = req.params.centreId

  if (centreId) {
    res.locals.centre = centres[centreId]
    res.locals.centre.id = centreId
  } else {
    res.locals.centre = centres['fiveways']
    res.locals.centre.id = 'fiveways'
  }
};

router.get('/assessment-centres', function (req, res, next) {
  res.locals.centres = require(filePath + '/data/centres.js')
  next()
})

router.get('/booking/history', function (req, res, next) {
  res.locals.comments = commentsData
  next()
})

router.post('/booking/history', function (req, res, next) {
  var time = new Date()
  res.locals.comments = commentsData

  res.locals.comments.push({
    comment: req.body.comment,
    timestamp: time.getTime(),
    dateFormatted: moment(time).format('dddd DD MMM YYYY hh:mm a'),
    name: 'Shelia Hopper',
    hasComment: true,
    isCustomer: true
  })
  res.render(viewPath + '/booking/history')
})
router.post('/booking/cancel-appointment', function (req, res, next) {
  if (req.body.change_now === 'true') {
    res.redirect('timepicker')
  } else {
    res.redirect('/fha/v' + versionNumber + '/appointments-changed?reason=' + req.body.reason)
  }
})

router.post('/booking/bobby_timeline', function (req, res, next) {
  var time = new Date()
  commentsData.push({
    timestamp: time.getTime(),
    dateFormatted: moment(time).format('dddd DD MMM YYYY hh:mm a'),
    name: 'Shelia Hopper',
    hasComment: false,
    isCustomer: req.body.caller === 'customer',
    authenticated: req.body.confirmed
  })
  res.render(viewPath + '/booking/bobby_timeline')
})

router.get('/assessment-centres', function (req, res, next) {
  res.locals.centres = require(filePath + '/data/centres.js')
  next()
})

router.get('/decision_maker', function (req, res, next) {
  var customers = require(filePath + '/data/decisionMaker.js')
  res.locals.customers = customers.map(customer => {
    var arrivedTime = moment(customer.appointmentTime, 'h:mma')
    customer.timeArrived = arrivedTime.add(customer.arrivedTime, 'minutes').format('h:mma')

    return customer
  })
  next()
})

router.get('*/:customerId/appointment-details', function (req, res, next) {
  res.locals.history = appointmentHistory.filter(entry => entry._id == req.params.customerId)
  console.log(res.locals.history)
  next()
})

router.get('/booking/referrals/:customerId', function (req, res, next) {
  res.render(viewPath + '/booking/customer-referral')
})

router.get('/booking/decision/:customerId/appointment-details', function (req, res, next) {
  res.locals.history = appointmentHistory.filter(entry => entry._id === req.params.customerId)
  next()
})

router.get('/booking/:customerId', function (req, res, next) {
  res.render(viewPath + '/booking/customer-booked')
})

router.get('/booking/decision/:customerId', function (req, res, next) {
  res.render(viewPath + '/booking/customer-booked')
})

router.get('/booking/decision/:customerId/details', function (req, res, next) {
  res.render(viewPath + '/booking/details/contact')
})

router.get('/booking/decision/:customerId/illness', function (req, res, next) {
  res.render(viewPath + '/booking/details/illness')
})

router.get('/booking/decision/:customerId/gp', function (req, res, next) {
  res.render(viewPath + '/booking/details/gp')
})

router.get('/booking/decision/:customerId/details', function (req, res, next) {
  res.render(viewPath + '/booking/details/contact')
})

router.get('/booking/decision/:customerId/timeline', function (req, res, next) {
  res.render(viewPath + '/booking/timeline')
})

router.get('/booking/decision/:customerId/evidence', function (req, res, next) {
  res.render(viewPath + '/booking/evidence/index')
})

router.get('/booking/decision/:customerId/evidence/:page', function (req, res, next) {
  res.render(viewPath + '/booking/evidence/' + req.params.page)
})

router.get('/booking/arrived/:customerId', function (req, res, next) {
  res.render(viewPath + '/booking/customer-booked')
})

router.get('/booking/arrived/:customerId/appointment-details', function (req, res, next) {
  res.locals.history = appointmentHistory.filter(entry => entry._id === req.params.customerId)

  res.render(viewPath + '/booking/appointment-details')
})

router.get('/booking/arrived/:customerId/details', function (req, res, next) {
  res.render(viewPath + '/booking/details/contact')
})

router.get('/booking/arrived/:customerId/illness', function (req, res, next) {
  res.render(viewPath + '/booking/details/illness')
})

router.get('/booking/arrived/:customerId/gp', function (req, res, next) {
  res.render(viewPath + '/booking/details/gp')
})

router.get('/booking/arrived/:customerId/details', function (req, res, next) {
  res.render(viewPath + '/booking/details/contact')
})

router.get('/booking/arrived/:customerId/timeline', function (req, res, next) {
  res.render(viewPath + '/booking/timeline')
})

router.get('/booking/arrived/:customerId/evidence', function (req, res, next) {
  res.render(viewPath + '/booking/evidence/index')
})

router.get('/booking/arrived/:customerId/evidence/:page', function (req, res, next) {
  res.render(viewPath + '/booking/evidence/' + req.params.page)
})

router.get('/booking/arrived/:customerId/:pageName', function (req, res, next) {
  res.render(viewPath + '/booking/' + req.params.pageName)
})

router.get('/booking/decision/:customerId/:page', function (req, res, next) {
  res.render(viewPath + '/booking/' + req.params.page)
})

router.get('/booking/:customerId/*', function (req, res, next) {
  res.locals.customer = appointmentCustomers
                          .filter(customer => customer._id === req.params.customerId)[0]

  console.log(res.locals.customer)
  next()
})

router.get('/assessment/:customerId/*', function (req, res, next) {
  res.locals.customer = assessmentCustomers
                          .filter(customer => customer._id === req.params.customerId)[0]

  console.log(res.locals.customer)
  next()
})

router.get('/assessment/:customerId/evidence/typicalDayEdit/:commentId', function (req, res, next) {
  res.locals.comment = req.session.data.typicalDayComments.filter(item => item.id === req.params.commentId)[0]

  res.render(viewPath + '/assessment/evidence/contentEditDay')
})

router.get('/assessment/:customerId/evidence/observedBehaviourEdit/:commentId', function (req, res, next) {
  res.locals.comment = req.session.data.observedBehaviourComments.filter(item => item.id === req.params.commentId)[0]

  res.render(viewPath + '/assessment/evidence/contentEditDay')
})

router.post('/assessment/:customerId/evidence/typicalDayEdit', function (req, res, next) {
  req.session.data.typicalDayComments.map(function (item) {
    if (item.id === req.body.id) {
      item.comment = req.body.comment
    }
  })
  console.log(req.session.data.typicalDayComments)

  next()
})

router.post('/assessment/:customerId/evidence/observedBehaviourEdit', function (req, res, next) {
  req.session.data.observedBehaviourComments.map(function (item) {
    if (item.id === req.body.id) {
      item.comment = req.body.comment
    }
  })
  console.log(req.session.data.observedBehaviourComments)

  next()
})

router.get('/assessment/:customerId/evidence/socialWorkHistoryEdit/:commentId', function (req, res, next) {
  res.locals.comment = req.session.data.socialWorkComments.filter(item => item.id === req.params.commentId)[0]
  res.render(viewPath + '/assessment/evidence/contentEdit')
})

router.get('/assessment/:customerId/evidence/conditionHistoryNew/:commentId', function (req, res, next) {
  res.locals.comment = req.session.data.conditionComments.filter(item => item.id === req.params.commentId)[0]
  res.render(viewPath + '/assessment/evidence/contentEditCondition')
})

router.post('/assessment/:customerId/evidence/socialWorkHistoryEdit', function (req, res, next) {
  req.session.data.socialWorkComments.map(function (item) {
    if (item.id === req.body.id) {
      item.comment = req.body.comment
    }
  })
  console.log(req.session.data.socialWorkComments)

  next()
})

router.post('/assessment/:customerId/evidence/conditionHistoryNew', function (req, res, next) {
  req.session.data.conditionComments.map(function (item) {
    if (item.id === req.body.id) {
      item.comment = req.body.comment
    }
  })
  console.log(req.session.data.conditionComments)

  next()
})

router.post('/assessment/:customerId/evidence/socialWorkHistory', function (req, res, next) {
  if (req.body.delete == 'true') {
    req.session.data.socialWorkComments = req.session.data.socialWorkComments.filter(item => item.id != req.body.id)
  } else {
    req.session.data.socialWorkComments.push({
      id: crypto.randomBytes(16).toString('hex'),
      comment: req.body.comments,
      time: moment().format()
    })

    res.locals.comments = req.session.data.socialWorkComments
  }
  next()
})

router.post('/assessment/:customerId/evidence/typicalDay', function (req, res, next) {
  if (req.body.delete == 'true') {
    req.session.data.typicalDayComments = req.session.data.typicalDayComments.filter(item => item.id != req.body.id)
  } else {
    req.session.data.typicalDayComments.push({
      id: crypto.randomBytes(16).toString('hex'),
      comment: req.body.comments,
      time: moment().format()
    })

    res.locals.comments = req.session.data.typicalDayComments
  }
  next()
})

router.post('/assessment/:customerId/evidence/observedBehaviour', function (req, res, next) {
  if (req.body.delete == 'true') {
    req.session.data.observedBehaviourComments = req.session.data.observedBehaviourComments.filter(item => item.id != req.body.id)
  } else {
    req.session.data.observedBehaviourComments.push({
      id: crypto.randomBytes(16).toString('hex'),
      comment: req.body.comments,
      time: moment().format()
    })

    res.locals.comments = req.session.data.observedBehaviourComments
  }
  next()
})

router.post('/assessment/:customerId/evidence/conditionHistoryNew', function (req, res, next) {
  if (req.body.delete == 'true') {
    req.session.data.conditionComments = req.session.data.conditionComments.filter(item => item.id != req.body.id)
  } else {
    req.session.data.conditionComments.push({
      id: crypto.randomBytes(16).toString('hex'),
      comment: req.body.comments,
      time: moment().format()
    })

    res.locals.comments = req.session.data.conditionComments
  }
  next()
})

router.get('/assessment/:customerId/evidence/socialWorkHistory*', function (req, res, next) {
  res.locals.comments = req.session.data.socialWorkComments
  next()
})

router.get('/assessment/:customerId/evidence/typicalDay', function (req, res, next) {
  res.locals.comments = req.session.data.typicalDayComments
  next()
})

router.get('/assessment/:customerId/evidence/observedBehaviour', function (req, res, next) {
  res.locals.comments = req.session.data.observedBehaviourComments
  next()
})

router.get('/assessment/:customerId/evidence/conditionHistoryNew', function (req, res, next) {
  res.locals.comments = req.session.data.conditionComments
  next()
})

router.get('/assessment/evidence/wca-index', function (req, res, next) {
  next()
})

router.post('/assessment/evidence/wca-index', function (req, res, next) {
  req.session.data.assessmentStartTime = moment().format()
  next()
})

router.post('/assessment/evidence/medical_assessment_dashboard', function (req, res, next) {
  req.session.data.assessmentEndTime = moment().format()
  next()
})

router.get('/booking/referrals/:customerId/gp', function (req, res, next) {
  res.render(viewPath + '/booking/details/gp')
})

router.get('/booking/referrals/:customerId/illness', function (req, res, next) {
  res.render(viewPath + '/booking/details/illness')
})

router.get('/booking/referrals/:customerId/details', function (req, res, next) {
  res.render(viewPath + '/booking/details/contact')
})

router.get('/booking/referrals/:customerId/timeline', function (req, res, next) {
  res.render(viewPath + '/booking/timeline')
})

router.get('/booking/referrals/:customerId/timeline-scrutiny', function (req, res, next) {
  res.render(viewPath + '/booking/timeline-scrutiny')
})

router.get('/booking/referrals/:customerId/appointment-details', function (req, res, next) {
  res.render(viewPath + '/booking/appointment-details')
})

router.get('/booking/referrals/:customerId/evidence', function (req, res, next) {
  res.render(viewPath + '/booking/evidence/index')
})

router.get('/booking/referrals/:customerId/evidence/:page', function (req, res, next) {
  res.render(viewPath + '/booking/evidence/' + req.params.page)
})

router.get('/booking/:customerId/evidence/:page', function (req, res, next) {
  res.render(viewPath + '/booking/evidence/' + req.params.page)
})

router.get('/booking/:customerId/illness', function (req, res, next) {
  res.render(viewPath + '/booking/details/illness')
})

router.get('/booking/:customerId/gp', function (req, res, next) {
  res.render(viewPath + '/booking/details/gp')
})

router.get('/booking/:customerId/today', function (req, res, next) {
  res.render(viewPath + '/booking/details/today')
})
router.get('/booking/arrived/:customerId/send-home', function (req, res, next) {
  var appointmentTime = moment(res.locals.customer.appointmentTime, 'h:mma')
  res.locals.customer.timeArrived = appointmentTime.add(res.locals.customer.arrivedTime, 'minutes').format('h:mma')
  next()
})

router.get('/booking/:customerId/details', function (req, res, next) {
  res.render(viewPath + '/booking/details/index')
})

// router.get('/booking/:customerId/timeline', function(req, res, next){
 // res.render(viewPath +'/booking/timeline_booked');
// })

router.post('/booking/mendez/mendez_timeline-arrived', function (req, res, next) {
  res.locals.arrivedTimeMoment = moment(new Date())
  arrivedTime = res.locals.arrivedTimeMoment.format('h:mm a')
  res.locals.arrivedTime = arrivedTime

  res.render(viewPath + '/booking/mendez_timeline-arrived')
})

router.post('/booking/:customerId/timeline-arrived', function (req, res, next) {
  var customers = require(filePath + '/data/booked.js')
  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0]

  var arrivedTimeMoment = moment(new Date())
  res.locals.customer.timeArrived = arrivedTimeMoment.format('h:mm a')

  res.render(viewPath + '/booking/timeline-arrived')
})

router.get('/booking/mendez/*', function (req, res, next) {
  var startTime = moment(res.locals.arrivedTime, 'hh:mma')
  var endTime = moment(new Date(), 'hh:mm:ss a')

  var totalHours = (endTime.diff(startTime, 'hours'))
  var totalMinutes = endTime.diff(startTime, 'minutes')
  var clearMinutes = totalMinutes % 60
  res.locals.waitTime = totalMinutes // totalHours + " hours and " + clearMinutes + " minutes";
  next()
})

router.post('/booking/arrived/:customerId/send-home-2', function (req, res, next) {
  res.locals.postData = req.body
  var reason = req.body.otherReason || req.body.reason
  appointmentHistory.push({
    _id: req.params.customerId,
    title: 'Sent home unseen',
    comments: reason,
    entryDate: moment(new Date()).format(),
    appointmentDate: null,
    changedByCustomer: false
  })

  next()
})

router.get('/booking/:customerId/evidence', function (req, res, next) {
  res.render(viewPath + '/booking/evidence/index')
})

router.get('/booking/:customerId/:pageName', function (req, res, next) {
  res.render(viewPath + '/booking/' + req.params.pageName)
})

router.get('/capacity/manage-centre/:centreId*', function (req, res, next) {
  getCentreDetails(req, res)
  res.locals.staff = planningStaff.filter(staff => staff.homeCentre.toLowerCase() === req.params.centreId)
  next()
})

router.post('/capacity/manage-centre/:centreId*', function (req, res, next) {
  getCentreDetails(req, res)
  res.locals.staff = planningStaff.filter(staff => staff.homeCentre === req.params.centreId)
  next()
})

router.get('/capacity/manage-centre/:centreId', function (req, res, next) {
  res.render(viewPath + '/capacity/manage-centre/index')
})

router.get('/capacity/manage-centre/:centreId/:section*', function (req, res, next) {
  res.locals.selectedTab = req.params.section
  next()
})

router.post('/capacity/manage-centre/:centreId/:section*', function (req, res, next) {
  res.locals.selectedTab = req.params.section
  next()
})

router.get('/capacity/manage-centre/:centreId/manage-staff', function (req, res, next) {
  res.locals.staffTotals = {}
  res.locals.staffTotals.complex = res.locals.staff.filter(staff => staff.skill === 'Complex Neuro').length
  res.locals.staffTotals.neuro = res.locals.staff.filter(staff => staff.skill === 'Neuro').length
  res.locals.staffTotals.standard = res.locals.staff.filter(staff => staff.skill === 'Standard').length
  res.locals.staffTotals.scrutiny = res.locals.staff.filter(staff => staff.scrutinyPaperwork).length
  res.locals.staffTotals.total = res.locals.staff.length

  //
  res.render(viewPath + '/capacity/manage-staff/index')
})

router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId*', function (req, res, next) {
  var staff = planningStaff

  res.locals.centres = require(filePath + '/data/centres.js')
  console.log(res.locals.centres)

  res.locals.person = staff.filter(person => person.id === req.params.staffId)[0]
  var today = moment(new Date())
  res.locals.displayMonth = today.format('MMMM YYYY')
  var year = today.year()
  var month = today.month() + 1
  res.locals.calendar = new calendar.Calendar(0).monthdatescalendar(year, month)
  console.log(res.locals.calendar[0])
  res.locals.today = today.format()
  next()
})

router.post('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId*', function (req, res, next) {
  var staff = require(filePath + '/data/staff.js')
  res.locals.centres = require(filePath + '/data/centres.js')

  res.locals.person = staff.filter(person => person.id === req.params.staffId)[0]
  var today = moment(new Date(2018, 8, 9))
  var year = today.year()
  var month = today.month() + 1
  res.locals.calendar = new calendar.Calendar(0).monthdatescalendar(2018, 8)
  res.locals.today = today.format()
  next()
})

router.post('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId/staff-availability-2', function (req, res, next) {
  res.locals.formData = req.body
  res.render(viewPath + '/capacity/manage-staff/staff-availability-2')
})

router.post('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId/staff-profile-2', function (req, res, next) {
  res.locals.formData = req.body

  res.render(viewPath + '/capacity/manage-staff/staff-profile-2')
})

router.get('/capacity/manage-centre/:centreId/capacity-overbooked', function (req, res, next) {
  res.locals.staff = require(filePath + '/data/staff-overbooked.js')

  next()
})

router.get('/capacity/manage-centre/:centreId', function (req, res, next) {
  res.render(viewPath + '/capacity/manage-centre/index')
})

router.get('/capacity/manage-centre/:centreId/:section*', function (req, res, next) {
  res.locals.selectedTab = req.params.section
  next()
})

router.get('/capacity/manage-centre/:centreId/manage-staff', function (req, res, next) {
  res.locals.staffTotals = {}
  res.locals.staffTotals.complex = res.locals.staff.filter(staff => staff.skill === 'Complex Neuro').length
  res.locals.staffTotals.neuro = res.locals.staff.filter(staff => staff.skill === 'Neuro').length
  res.locals.staffTotals.standard = res.locals.staff.filter(staff => staff.skill === 'Standard').length
  res.locals.staffTotals.scrutiny = res.locals.staff.filter(staff => staff.scrutinyPaperwork).length
  res.locals.staffTotals.total = res.locals.staff.length

  //
  res.render(viewPath + '/capacity/manage-staff/inde')
})

router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId', function (req, res, next) {
  res.render(viewPath + '/capacity/manage-staff/staff-profile')
})

router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId/:section', function (req, res, next) {
  res.render(viewPath + '/capacity/manage-staff/' + req.params.section)
})

router.get('/capacity/manage-centre/:centreId/capacity-overbooked', function (req, res, next) {
  res.locals.staff = require(filePath + '/data/staff-overbooked.js')

  next()
})

router.get('/capacity/manage-centre/:centreId/capacity*', function (req, res, next) {
  res.locals.selectedTab = 'capacity'

  res.locals.staffTotals = {}
  res.locals.staffTotals.available = res.locals.staff.filter(function (obj) {
    if (obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny) {
      return false
    } else {
      return obj.days[req.query.day].available
    }
  }).length

  var totalAppointments = 0

  slotsData[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots)
  res.locals.totalAppointments = totalAppointments
  res.locals.slots = slotsData[req.query.day]
  res.locals.totalSlots = slotsData[req.query.day].length

  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots
  res.render("fha/v' + versionNumber +'/capacity/manage-centre/capacity")
})

router.get('/capacity/manage-centre/:centreId/details', function (req, res, next) {
  res.render(viewPath + '/capacity/manage-centre/index')
})

router.get('/capacity/manage-centre/:centreId/slots', function (req, res, next) {
  res.render(viewPath + '/capacity/manage-centre/index')
})
router.get('/capacity/manage-centre/:centreId/rooms', function (req, res, next) {
  res.render(viewPath + '/capacity/manage-centre/index')
})

router.get('/capacity/manage-centre/:centreId/:section', function (req, res, next) {
  res.render(viewPath + '/capacity/manage-centre/' + req.params.section)
})

router.post('/capacity/manage-centre/:centreId/manage-staff/new-staff-skill', function (req, res, next) {
  res.locals.person = {
    name: req.body.name,
    phone: req.body.phone,
    mobile: req.body.mobile,
    email: req.body.email
  }
  res.render(viewPath + '/capacity/manage-staff/new-staff-skill')
})

router.post('/capacity/manage-centre/:centreId/manage-staff/new-staff-hours', function (req, res, next) {
  res.locals.person = {
    name: req.body.name,
    phone: req.body.phone,
    mobile: req.body.mobile,
    email: req.body.email,
    scrutiny: req.body.scrutiny,
    skill: req.body.skill
  }
  res.render(viewPath + '/capacity/manage-staff/new-staff-hours')
})

router.post('/assessment-centres', function (req, res, next) {
  res.locals.centres = require(filePath + '/data/centres.js')
  var centre = {
    name: req.body.name,
    location: req.body.location
  }
  res.locals.centres[centre.name] = centre
  res.render(viewPath + '/assessment-centres')
})

router.post('/capacity/new-centre-2', function (req, res, next) {
  res.locals.centre = {
    name: req.body.name,
    location: req.body.location
  }
  res.render(viewPath + '/capacity/new-centre-2')
})

router.post('/capacity/new-centre-3', function (req, res, next) {
  res.locals.centre = {
    name: req.body.name,
    location: req.body.location
  }
  res.render(viewPath + '/capacity/new-centre-3')
})

router.post('/capacity/manage-centre/:centreId/manage-staff/', function (req, res, next) {
  var scrutiny = req.body.scrutiny === 'true'
  res.locals.person = {
    name: req.body.name,
    phone: req.body.phone,
    mobile: req.body.mobile,
    email: req.body.email,
    scrutinyPaperwork: scrutiny,
    skill: req.body.skill
  }
  res.locals.staff.push(res.locals.person)
  res.locals.query.tab = 'staff'

  res.locals.staffTotals = {}
  res.locals.staffTotals.complex = res.locals.staff.filter(staff => staff.skill === 'Complex Neuro').length
  res.locals.staffTotals.neuro = res.locals.staff.filter(staff => staff.skill === 'Neuro').length
  res.locals.staffTotals.standard = res.locals.staff.filter(staff => staff.skill === 'Standard').length
  res.locals.staffTotals.scrutiny = res.locals.staff.filter(staff => staff.scrutinyPaperwork).length
  res.locals.staffTotals.total = res.locals.staff.length

  res.render(viewPath + '/capacity/manage-staff/index')
})

router.get('/capacity/manage-centre/:centreId/manage-staff/:section', function (req, res, next) {
  res.render(viewPath + '/capacity/manage-staff/' + req.params.section)
})

router.post('/capacity/manage-centre/:centreId/edit-centre-3', function (req, res, next) {
  if (req.body['available-days-Saturday'] === 'on') {
    res.locals.saturday = true
  } else {
    res.locals.saturday = false
  }
  res.render(viewPath + '/capacity/manage-centre/edit-centre-3')
})

router.post('/capacity/manage-centre/:centreId/details', function (req, res, next) {
  res.locals.centre.details = req.body.details
  if (req.body.saturday == 'true') {
    res.locals.centre.openingTimes[5] = {
      'day': 'Saturday',
      'open': '10:00am - 3:00pm'
    }
  } else {
    res.locals.centre.openingTimes[5] = {
      'day': 'Saturday',
      'open': 'Closed'
    }
  }
  res.render(viewPath + '/capacity/manage-centre/index')
})

router.get('/capacity/manage-centre/capacity', function (req, res, next) {
  res.locals.staffTotals = {}
  res.locals.staffTotals.available = staffData.filter(function (obj) {
    if (obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny) {
      return false
    } else {
      return obj.days[req.query.day].available
    }
  }).length

  var totalAppointments = 0

  slotsData[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots)
  res.locals.totalAppointments = totalAppointments
  res.locals.slots = slotsData[req.query.day]
  res.locals.totalSlots = slotsData[req.query.day].length

  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots

  next()
})

router.get('/capacity/manage-centre/capacity-edit-slots', function (req, res, next) {
  res.locals.staffTotals = {}
  res.locals.staffTotals.available = staffData.filter(function (obj) {
    if (obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny) {
      return false
    } else {
      return obj.days[req.query.day].available
    }
  }).length

  var totalAppointments = 0

  slotsData[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots)
  res.locals.totalAppointments = totalAppointments
  res.locals.slots = slotsData[req.query.day]
  res.locals.totalSlots = slotsData[req.query.day].length

  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots
  next()
})

router.get('/capacity/manage-centre/capacity-holiday', function (req, res, next) {
  res.locals.staff = staffDataHoliday
  res.locals.staffTotals = {}
  res.locals.staffTotals.available = staffDataHoliday.filter(function (obj) {
    if (obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny) {
      return false
    } else {
      return obj.days[req.query.day].available
    }
  }).length

  var totalAppointments = 0

  slotsData[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots)
  res.locals.totalAppointments = totalAppointments
  res.locals.slots = slotsData[req.query.day]
  res.locals.totalSlots = slotsData[req.query.day].length

  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots

  next()
})

router.get('/capacity/manage-centre/capacity-2', function (req, res, next) {
  res.locals.staff = staffData2
  res.locals.staffTotals = {}
  res.locals.staffTotals.available = staffData2.filter(function (obj) {
    if (obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny) {
      return false
    } else {
      return obj.days[req.query.day].available
    }
  }).length

  var totalAppointments = 0

  slotsData2[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots)
  res.locals.totalAppointments = totalAppointments
  res.locals.slots = slotsData2[req.query.day]
  res.locals.totalSlots = slotsData2[req.query.day].length

  if (req.query.day == 'thursday') {
    res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots - 11
  } else {
    res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots
  }
  next()
})

router.get('/assessment/:customerId/general-observations', function (req, res, next) {
  res.locals.comments = req.session.data.observations
  next()
})

router.get('/assessment/:customerId/scoring/report-view', function (req, res, next) {
  res.locals.comments = req.session.data.observations
  next()
})

router.post('/assessment/:customerId/general-observations-post', function (req, res, next) {
  var time = new Date()
  res.locals.comments = req.session.data.observations

  res.locals.comments.push({
    comment: req.body.comment,
    timestamp: time.getTime(),
    dateFormatted: moment(time).format('dddd DD MMM YYYY hh:mm a'),
    name: 'Heather Harrison',
    hasComment: true,
    isCustomer: true
  })
  res.redirect(301, '/fha/v' + versionNumber + '/assessment/' + req.params.customerId + '/general-observations')
})

router.get('/planning/*', function (req, res, next) {
  next()
})

var planningCentres = require(filePath + '/data/capacity/monday.js')
var planningStaff = require(filePath + '/data/capacity/allocatedStaff.js').filter(staff => staff.allocatedCentre !== '')

var resetCentres = function () {
  planningCentres.forEach(function (centre) {
    centre.morning = {
      reviews: [],
      assessments: [],
      complex: 0,
      neuro: [],
      review: []
    }

    centre.afternoon = {
      assessments: [],
      reviews: [],
      complex: 0,
      neuro: [],
      review: []
    }

    centre.allocatedStaff = []

    centre.complex = 0
    planningStaff.forEach(function (staff) {
      if (staff.allocatedCentre == centre.name) {
        centre.allocatedStaff.push(staff)
        if (staff.morning != 'unnavailable') {
          centre.morning[staff.morning].push(staff)
          if (staff.complexNeuro) {
            centre.morning.complex ++
          }
        }
        if (staff.afternoon != 'unnavailable') {
          centre.afternoon[staff.afternoon].push(staff)
          if (staff.complexNeuro) {
            centre.afternoon.complex ++
          }
        }
      }
    })
  })
}

router.get('/planning/day/:day', function (req, res, next) {
  resetCentres(req, res)

  res.locals.centres = planningCentres

  res.render(viewPath + '/planning/area-day')
})

router.get('/planning/centre/:centre', function (req, res, next) {
  resetCentres(req, res)

  res.locals.centre = planningCentres.filter(centre => centre.name == req.params.centre)[0]

  res.locals.staff = res.locals.centre.allocatedStaff
  res.locals.centreName = req.params.centre
  res.render(viewPath + '/planning/assigned-staff')
})

router.get('/planning/reassign/:centre/:staffId', function (req, res, next) {
  res.locals.centre = planningCentres.filter(centre => centre.name == req.params.centre)[0]

  res.locals.staff = planningStaff.filter(staff => staff.id === req.params.staffId)[0]

  res.render(viewPath + '/planning/reassign')
})

router.post('/planning/centre/:centre', function (req, res, next) {
  planningStaff.map(staff => {
    if (req.body.staffId === staff.id) {
      console.log(staff)
      staff.morning = req.body.morning || staff.morning
      staff.afternoon = req.body.afternoon || staff.afternoon
      staff.allocatedCentre = req.body.location

      console.log(staff)
    }
  })

  next()
})

var reviewCustomers = require(filePath + '/data/reviews/readyForReview.js')

router.get('/review', function (req, res, next) {
  res.locals.customers = reviewCustomers
  next()
})

router.get('/ready-for-review', function (req, res, next) {
  res.locals.customers = reviewCustomers
                            .filter(customer => customer.status === 'review')
  next()
})

router.post('/ready-for-review', function (req, res, next) {
  var body = req.body
  req.session.data['filter'] = '';
  res.locals.customers = reviewCustomers
    .filter(customer => customer.status === 'review')
  if (body.filter) {
    req.session.data['filter'] = body.filter;
    let filters = Array.isArray(body.filter) ? body.filter : [ body.filter ];

    res.locals.customers = res.locals.customers.filter(function (e) {
      for (let i = 0; i < filters.length; i++) {
        if (e.tags.includes(filters[i])) {
          return true
        }
      }
      return false
    })
  }
  res.render(viewPath + '/ready-for-review')
})

router.get('/requested-medical-evidence', function (req, res, next) {
  res.locals.customers = reviewCustomers
                            .filter(customer => customer.status === 'fme')
  next()
})

router.get('/scrutiny/:customerId/*', function (req, res, next) {
  res.locals.customer = reviewCustomers
                          .filter(customer => customer._id === req.params.customerId)[0]

  next()
})

router.get('/security/:customerId/*', function (req, res, next) {
  res.locals.customer = appointmentCustomers
                          .filter(customer => customer._id === req.params.customerId)[0]

  next()
})

router.get('/scrutiny/:customerId/details', function (req, res, next) {
  res.render(viewPath + '/scrutiny/details/index')
})

router.get('/scrutiny/:customerId/details/:pageName', function (req, res, next) {
  res.render(viewPath + '/scrutiny/details/' + req.params.pageName)
})

router.get('/scrutiny/:customerId/evidence', function (req, res, next) {
  res.render(viewPath + '/scrutiny/evidence/index')
})

router.get('/scrutiny/:customerId/evidence/:pageName', function (req, res, next) {
  res.render(viewPath + '/scrutiny/evidence/' + req.params.pageName)
})

router.get('/assessment/:customerId/evidence/socialWorkHistoryEdit/:pageName', function (req, res, next) {
  res.render(viewPath + '/assessment/evidence/socialWorkHistoryEdit' + req.params.pageName)
})

router.get('/scrutiny/:customerId/:pageName', function (req, res, next) {
  res.render(viewPath + '/scrutiny/' + req.params.pageName)
})

router.get('/security/:customerId/:pageName', function (req, res, next) {
  res.render(viewPath + '/security/' + req.params.pageName)
})

router.post('/scrutiny/:customerId/fme-confirm', function (req, res, next) {
  reviewCustomers.map(customer => {
    if (customer._id === req.params.customerId) {
      customer.fmeRequestedDate = moment().format()
      customer.fmeType = req.session.data.type
      customer.status = 'fme'

      delete req.session.data.type

      console.log(customer)
    }
  })

  res.redirect(301, '/fha/v' + versionNumber + '/scrutiny/' + req.params.customerId + '/timeline')
})

/// Decision maker routes ------------------------------------------------------------------------//
var dmCustomers = require(filePath + '/data/dm/dm.js')

router.get('/decision-maker', function (req, res, next) {
  res.locals.customers = dmCustomers

  next()
})

router.get('/decisionmaker/:customerId/*', function (req, res, next) {
  res.locals.customer = dmCustomers
                          .filter(customer => customer._id === req.params.customerId)[0]

  console.log(res.locals.customer)
  next()
})

router.get('/decisionmaker/:customerId/timeline', function (req, res, next) {
  res.render(viewPath + '/decisionmaker/timeline')
})

router.get('/decisionmaker/:customerId/appointment', function (req, res, next) {
  res.render(viewPath + '/decisionmaker/appointment')
})

router.get('/decisionmaker/:customerId/evidence', function (req, res, next) {
  res.render(viewPath + '/decisionmaker/evidence/index')
})

router.get('/decisionmaker/:customerId/decision', function (req, res, next) {
  res.render(viewPath + '/decisionmaker/decision/index')
})

router.get('/decisionmaker/:customerId/decision/:pageName', function (req, res, next) {
  res.render(viewPath + '/decisionmaker/decision/' + req.params.pageName)
})

router.get('/decisionmaker/:customerId/details', function (req, res, next) {
  res.render(viewPath + '/decisionmaker/details/index')
})

router.get('/decisionmaker/:customerId/details/:pageName', function (req, res, next) {
  res.render(viewPath + '/decisionmaker/details/' + req.params.pageName)
})

/// END decision maker routes ------------------------------------------------------------------------//

router.get('/assessment-reports', function (req, res, next) {
  res.locals.customers = dmCustomers
  .filter(customer => customer.status === 'Assessment reports')
  next()
})

router.get('/failed-to-attend', function (req, res, next) {
  res.locals.customers = dmCustomers
  .filter(customer => customer.status === 'Failed to attend appointment')
  next()
})


router.post('/failed-to-attend', function (req, res, next) {
  var body = req.body
  req.session.data['filter'] = '';
  res.locals.customers = dmCustomers
    .filter(customer => customer.status === 'Failed to attend appointment')
  if (body.filter) {
    req.session.data['filter'] = body.filter;
    let filters = Array.isArray(body.filter) ? body.filter : [ body.filter ];

    res.locals.customers = res.locals.customers.filter(function (e) {
      for (let i = 0; i < filters.length; i++) {
        if (e.tags.includes(filters[i])) {
          return true
        }
      }
      return false
    })
  }
  res.render(viewPath + '/failed-to-attend')
})

router.get('/fta-ready-for-decision', function (req, res, next) {
  res.locals.customers = dmCustomers
  .filter(customer => customer.substatus === 'Ready for decision')
  next()
})

router.get('/fta-request-reason', function (req, res, next) {
  res.locals.customers = dmCustomers
  .filter(customer => customer.substatus === 'Request a reason')
  next()
})

router.get('/fta-record-reason', function (req, res, next) {
  res.locals.customers = dmCustomers
  .filter(customer => customer.substatus === 'Record a reason')
  next()
})

router.get('/good-cause', function (req, res, next) {
  res.locals.customers = dmCustomers
  .filter(customer => customer.status === 'Questionnaire not returned')
  next()
})

var assessmentCustomers = require(filePath + '/data/assessment/readyForAssessment.js')

router.get('/assessment', function (req, res, next) {
  res.locals.customers = assessmentCustomers

  next()
})

router.get('/ready-for-assessment', function (req, res, next) {
  res.locals.customers = assessmentCustomers
                            .filter(customer => customer.status === 'Ready for assessment')
  next()
})

router.get('/assessment-stopped', function (req, res, next) {
  res.locals.customers = assessmentCustomers
                            .filter(customer => customer.status === 'Assessment stopped')
  next()
})

router.get('/completed-assessments', function (req, res, next) {
  res.locals.customers = assessmentCustomers
                            .filter(customer => customer.status === 'Assessment completed')
  next()
})

router.get('/todays-appointments', function (req, res, next) {
  res.locals.customers = assessmentCustomers
                            .filter(customer => customer.status === 'Appointment today')
  next()
})

router.get('/ready-to-book', function (req, res, next) {
  res.locals.customers = assessmentCustomers
                            .filter(customer => customer.status === 'Ready to book')
  next()
})

router.get('/booked', function (req, res, next) {
  res.locals.customers = assessmentCustomers
                            .filter(customer => customer.status === 'Booked')
  next()
})

router.get('/assessment/:customerId/assessment*', function (req, res, next) {
  res.locals.customer = assessmentCustomers
                          .filter(customer => customer._id === req.params.customerId)[0]

  console.log(res.locals.customer)
  next()
})

router.get('/assessment/:customerId/details', function (req, res, next) {
  res.render(viewPath + '/assessment/details/index')
})

router.get('/assessment/:customerId/details/:pageName', function (req, res, next) {
  res.render(viewPath + '/assessment/details/' + req.params.pageName)
})

router.get('/assessment/:customerId/evidence', function (req, res, next) {
  res.render(viewPath + '/assessment/evidence/index')
})

router.get('/assessment/:customerId/evidence/:pageName', function (req, res, next) {
  res.render(viewPath + '/assessment/evidence/' + req.params.pageName)
})

router.get('/assessment/:customerId/dashboard', function (req, res, next) {
  res.render(viewPath + '/assessment/evidence/illnessEffects')
})

router.get('/assessment/:customerId/scoring', function (req, res, next) {
  res.render(viewPath + '/assessment/scoring/index')
})

router.get('/assessment/:customerId/scoring/:pageName', function (req, res, next) {
  res.render(viewPath + '/assessment/scoring/' + req.params.pageName)
})

router.post('/assessment/:customerId/ready-for-recommendation', function (req, res, next) {
  assessmentCustomers.map(customer => {
    if (customer._id === req.params.customerId) {
      customer.status = 'Ready for recommendation'

      delete req.session.data.type

      console.log(customer)
    }
  })

  res.redirect(301, '/fha/v' + versionNumber + '/assessment/' + req.params.customerId + '/evidence/medical_assessment_dashboard')
})

router.post('/assessment/:customerId/completed-assessment', function (req, res, next) {
  assessmentCustomers.map(customer => {
    if (customer._id === req.params.customerId) {
      customer.status = 'Assessment completed'

      delete req.session.data.type

      console.log(customer)
    }
  })

  res.redirect(301, '/fha/v' + versionNumber + '/assessment/' + req.params.customerId + '/scoring/report-print')
})

router.post('/assessment/:customerId/ready-for-assessment', function (req, res, next) {
  assessmentCustomers.map(customer => {
    if (customer._id === req.params.customerId) {
      customer.status = 'Ready for assessment'

      delete req.session.data.type

      console.log(customer)
    }
  })

  res.redirect(301, '/fha/v' + versionNumber + '/assessment/' + req.params.customerId + '/timeline')
})

router.post('/assessment/:customerId/todays-appointments', function (req, res, next) {
  assessmentCustomers.map(customer => {
    if (customer._id === req.params.customerId) {
      customer.status = 'Appointment today'

      delete req.session.data.type

      console.log(customer)
    }
  })

  res.redirect(301, '/fha/v' + versionNumber + '/assessment/' + req.params.customerId + '/timeline')
})

router.post('/assessment/:customerId/booked', function (req, res, next) {
  assessmentCustomers.map(customer => {
    if (customer._id === req.params.customerId) {
      customer.status = 'Booked'

      delete req.session.data.type

      console.log(customer)
    }
  })

  res.redirect(301, '/fha/v' + versionNumber + '/assessment/' + req.params.customerId + '/timeline')
})

router.post('/assessment/:customerId/ready-to-book', function (req, res, next) {
  assessmentCustomers.map(customer => {
    if (customer._id === req.params.customerId) {
      customer.status = 'Ready to book'

      delete req.session.data.type

      console.log(customer)
    }
  })

  res.redirect(301, '/fha/v' + versionNumber + '/assessment/' + req.params.customerId + '/timeline')
})

router.get('/assessment/:customerId/descriptor-:descriptorName', function (req, res, next) {
  assessmentCustomers.map(customer => {
    if (customer._id === req.params.customerId) {
      customer.descriptor = req.params.descriptorName
      console.log(customer)
    }
  })

  res.render(viewPath + '/assessment/scoring/moving1')
})

router.get('/assessment/:customerId/:pageName', function (req, res, next) {
  res.render(viewPath + '/assessment/' + req.params.pageName)
})

router.post('/scrutiny/:customerId/booking-post', function (req, res, next) {
  var bookingCustomers = require(filePath + '/data/referrals.js')

  res.locals.customer.receivedDate = moment().format()
  bookingCustomers.push(res.locals.customer)

  reviewCustomers = reviewCustomers.filter(customer => customer._id !== req.params.customerId)

  res.redirect(301, '/fha/v' + versionNumber + '/booking/referrals/' + req.params.customerId + '/timeline-scrutiny')
})

router.get('/planning/*', function (req, res, next) {
  next()
})

var planningCentres = require(filePath + '/data/capacity/monday.js')
var planningStaff = require(filePath + '/data/capacity/allocatedStaff.js').filter(staff => staff.allocatedCentre !== '')

var resetCentres = function () {
  planningCentres.forEach(function (centre) {
    centre.morning = {
      reviews: [],
      assessments: [],
      complex: 0,
      neuro: [],
      review: []
    }

    centre.afternoon = {
      assessments: [],
      reviews: [],
      complex: 0,
      neuro: [],
      review: []
    }

    centre.allocatedStaff = []

    centre.complex = 0
    planningStaff.forEach(function (staff) {
      if (staff.allocatedCentre == centre.name) {
        centre.allocatedStaff.push(staff)
        if (staff.morning != 'unnavailable') {
          centre.morning[staff.morning].push(staff)
          if (staff.complexNeuro) {
            centre.morning.complex ++
          }
        }
        if (staff.afternoon != 'unnavailable') {
          centre.afternoon[staff.afternoon].push(staff)
          if (staff.complexNeuro) {
            centre.afternoon.complex ++
          }
        }
      }
    })
  })
}

router.get('/planning/day/:day', function (req, res, next) {
  resetCentres(req, res)

  res.locals.centres = planningCentres

  res.render(viewPath + '/planning/area-day')
})

router.get('/planning/centre/:centre', function (req, res, next) {
  resetCentres(req, res)

  res.locals.centre = planningCentres.filter(centre => centre.name == req.params.centre)[0]

  res.locals.staff = res.locals.centre.allocatedStaff
  res.locals.centreName = req.params.centre
  res.render(viewPath + '/planning/assigned-staff')
})

router.get('/planning/reassign/:centre/:staffId', function (req, res, next) {
  res.locals.centre = planningCentres.filter(centre => centre.name == req.params.centre)[0]

  res.locals.staff = planningStaff.filter(staff => staff.id === req.params.staffId)[0]

  res.render(viewPath + '/planning/reassign')
})

router.post('/planning/centre/:centre', function (req, res, next) {
  planningStaff.map(staff => {
    if (req.body.staffId === staff.id) {
      console.log(staff)
      staff.morning = req.body.morning || staff.morning
      staff.afternoon = req.body.afternoon || staff.afternoon
      staff.allocatedCentre = req.body.location

      console.log(staff)
    }
  })

  next()
})

router.post('/search-results-id', function (req, res, next) {
  var sanitizeField = function (string) {
    return string.replace(/\s/g, '').toUpperCase()
  }
  var NINO = req.body.search.trim('')
  res.locals.customers = appointmentCustomers
          .filter(customer => sanitizeField(customer.NINO) === sanitizeField(req.body.search))

  res.locals.searchField = req.body.search
  res.render(viewPath + '/search-results-id')
})

router.post('/search-results', function (req, res, next) {
  var sanitizeField = function (string) {
    return string.replace(/\s/g, '').toUpperCase()
  }
  var NINO = req.body.search.trim('')
  res.locals.customers = reviewCustomers
          .filter(customer => sanitizeField(customer.NINO) === sanitizeField(req.body.search))

  res.locals.searchField = req.body.search
  res.render(viewPath + '/search-results')
})

router.post('/assessment/:customerId/evidence/mentalHealthAssessment', function (req, res, next) {
  var mentalHealthFields = [
    'Appearance',
    'Behaviour',
    'Speech',
    'Mood',
    'Cognition',
    'General',
    'Insight',
    'Thoughts',
    'Perceptions',
    'Addiction',
    'Involentry-movements',
    'Cognative-test']
  var count = 0
  mentalHealthFields.forEach(function (mhelement, index) {
    if (req.session.data[mhelement]) {
      count++
    }
    req.session.data.mentalHealthCount = count
    console.log('Mental Health count: ' + count)
    next()
  })
})

router.post('/decisionmaker/:customerId/decision/timeline', function (req, res) {
  var balls = req.session.data['whatcando']

  if (balls == 'newappointment') {
    res.redirect('/fha/v' + versionNumber + '/decisionmaker/' + req.params.customerId + '/timeline')
  } else {
    res.redirect('/fha/v' + versionNumber + '/decisionmaker/' + req.params.customerId + '/decision/close-reason')
  }
})

router.get('/send-home-book', function (req, res) {
  var locale = 'en-GB'

  res.render('location-picker-8', {
   // html_lang: 'en',
    // graph: locationServiceV3.locationGraph,
    // locations: locationServiceV3.canonicalLocationList(locale),
    // reverseMap: locationServiceV3.locationReverseMap(locale),
    // locale: locale
  })
})

/// appointment data -------

var appointmentCustomers = require(filePath + '/data/appointment/appointments.js')

router.get('/appointments', function (req, res, next) {
  res.locals.customers = appointmentCustomers

  next()
})

router.get('/did-not-attend', function (req, res, next) {
  res.locals.customers = appointmentCustomers
                            .filter(customer => customer.status === 'Did not attend')
  next()
})

router.get('/ready-to-book', function (req, res, next) {
  res.locals.customers = appointmentCustomers
                            .filter(customer => customer.status === 'Ready to book')
  next()
})

router.get('/booked-appointments', function (req, res, next) {
  res.locals.customers = appointmentCustomers
                            .filter(customer => customer.status === 'Booked')
  next()
})

router.get('/"date": "06 2017"', function (req, res, next) {
  res.locals.customers = appointmentCustomers
                            .filter(customer => customer.status === 'Ready to book')
  next()
})

router.get('/booking/:customerId/evidence', function (req, res, next) {
  res.render(viewPath + '/booking/details/index')
})

router.get('/booking/:customerId/details/:pageName', function (req, res, next) {
  res.render(viewPath + '/booking/details/' + req.params.pageName)
})

router.get('/priority-booking', function (req, res, next) {
  res.locals.customers = appointmentCustomers
  .filter(customer => customer.substatus === 'Priority booking')
  next()
})

router.get('/welfare-call-required', function (req, res, next) {
  res.locals.customers = appointmentCustomers
  .filter(customer => customer.substatus === 'Wellfair call required')
  next()
})

/// end appointment data -------

module.exports = router
