var express = require('express')
var router = express.Router()
var path = require('path')
var moment = require('moment')
var tog = require('../../../../lib/tog.js')
var request = require('request')
var calendar = require('node-calendar');
var moment = require('moment')
const crypto = require("crypto");

var versionNumber = "1-1";
var filePath = '../../../../app/views/fha/v' + versionNumber;
var viewPath = 'fha/v' + versionNumber;


var staffDataHoliday = require(filePath +'/data/staff-data-holiday.js')
var staffData2 = require(filePath +'/data/staff-data-2.js')
var slotsData = require(filePath +'/data/slots-data.js')
var slotsData2 = require(filePath +'/data/slots-data-2.js')
var commentsData = require(filePath +'/data/comments.js');
var appointmentHistory = require(filePath +'/data/appointmentHistory.js');
var observations = [];
var socialWorkComments = [];
var typicalDayComments = [];


router.get('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.path1 = res.locals.path + "/" + bits[0]
  res.locals.path2 = res.locals.path + "/" + bits[0] + "/" + bits[1]
  res.locals.stage = 1;
  res.locals.observations=observations;
  res.locals.cssPath = '/public/stylesheets/fha_v' + versionNumber +'.css';
  res.locals.javascriptPath = "/public/javascripts/application_v" + versionNumber + ".js"
  res.locals.versionNumber = versionNumber;
  next()
})

router.get('/miarussell/*', function (req, res, next) {
  res.locals.firstname = "Mia"
  next()
})

router.get('/victorcastillo/*', function (req, res, next) {
  res.locals.firstname = "Victor"
  next()
})

router.get('/cookies/', function (req, res, next) {
  res.send(tog(req.cookies));
})

router.get('*/record_phys_exam', function (req, res, next) {
  req.session.data.physexam = true;
  // res.send(tog(req.session.data));
  // res.send(tog(req.params[0]));
  res.redirect('/'+res.locals.path+'/victorcastillo/evidence/finish')
})

var nug_id = 0;

/*
  Used to save indiviudal "nuggets" of evidence from the add evidence screen
*/
router.post('/saveText/', function (req, res, next) {
  var newNugget = {
    "text":req.body.nugget,
    "id":nug_id++,
    "time": new Date()
  }
  req.session.data.nuggets = req.session.data.nuggets ? req.session.data.nuggets : [];
  req.session.data.nuggets.push(newNugget);
  res.send(tog(req.session.data));
})

/*
  Clears session (triggered by little link at bottom of pages)
*/
router.get('/clearSession',function(req, res, next) {
  req.session.data.nuggets = [];
  req.session.data.withdesc = false;
  req.session.data.physexam = false;
  req.session.data = {};
  observations = [];
  socialWorkComments = [];
  typicalDayComments = [];
  nug_id = 0;
  res.send("success");
})

router.post('/updateEvidence',function(req, res, next) {
  var id = req.body.id;
  var nug = _.find(req.session.data.nuggets, {"id":parseInt(id)})
  nug.descriptors = req.body.descriptors;
  req.session.data.withdesc = true;
  res.send(tog(req.session.data.nuggets));
})

router.get('/prefillAssessment',function(req, res, next) {
  req.session.data.nuggets = [];
  var bits = [
     "The client experiences nausea as a result of their pain medication"
    ,"He says he used to sleep a lot but isn't doing that so much anymore"
    ,"Broke his right leg in Aug 2015 following a motorbike accident. He fractured the whole of his leg. He had surgery and has 2 bolts in his knee to hold his knee together. He also has an external fixator on his right let from his knee down. Had been to physiotherapy twice but has been told there is only so much that they can do until his leg is healed."
    ,"Some days he can't to the exercises at all due to pain"
    ,"They have given him basic leg exercises to do at home to help build his calf muscle. He has a lot of muscle wasting in his right thigh and says the exercises are helping a bit"
    ,"Has an appointment with the surgeon today and is getting hospital transport there"
    ,"Is seeign his surgeon regularly for review of his leg and to adjust his fixator, seeing him every couple of weeks and having the fixator adjusted every week"
    ,"His specialist has advised that it will be about 4 months before he will heal and the cage will be removed. Has had the cage on for 6 weeks now. He says at first he couldn't do anything and was housebound. Now he is able to do more with the use of 2 crutches. Can weight bare a little bit now on his right leg"
    ,"Used to take morphine for pain but is not taking this anymore as his pain is improving"
  ]
  var time = moment(new Date());
  for (var i = bits.length-1; i > -1; i--) {
    // console.log(time)
    var newNugget = {
      "text":bits[i],
      "id":i,
      "time": moment(time),
    }
    // console.log(newNugget)
    req.session.data.nuggets.push(newNugget);
    time.subtract(3,'minutes');
  }
  nug_id = bits.length;
  req.session.data.physexam = true;
  res.send("success");
})


var arrivedTime = "";

var getAppointmentDates = function(){
  var appointments = {} 

  appointments.nextAvailable = moment().add(15, 'days').hours(11).minutes(0);
  appointments.today = moment().hours(14).minutes(0);

  return appointments;
}


router.get('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.root = '/fha/v' + versionNumber
  res.locals.manageStaffPath = viewPath +'/capacity/manage-staff'
  res.locals.path1 = res.locals.path + "/" + bits[0]
  res.locals.path2 = res.locals.path + "/" + bits[0] + "/" + bits[1]
  res.locals.stage = req.cookies.stage || 1;
  res.locals.query = req.query;
  res.locals.arrivedTime = arrivedTime;

  //res.locals.staff = staffData;
  res.locals.appointments = getAppointmentDates();

for(property in req.session.data){
    res.locals[property] = req.session.data[property];
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
  res.locals.path1 = res.locals.path + "/" + bits[0]
  res.locals.path2 = res.locals.path + "/" + bits[0] + "/" + bits[1]
  res.locals.stage = req.cookies.stage || 1;
  res.locals.query = req.query;
  res.locals.arrivedTime = arrivedTime;

  
  //res.locals.staff = staffData;
  next()
})





router.get('/booking/mendez*', function(req, res, next){

})
router.post('/booking/cancel-appointment', function(req, res, next){
  
    if(req.body.change_now === "true"){
      res.redirect('timepicker')
    } else {
      res.redirect('/fha/v' + versionNumber +'/appointments-changed?reason=' + req.body.reason)
    }

  })


function getCentreDetails(req, res){
  var centres = require(filePath +'/data/centres.js'),
        centreId = req.params.centreId;

  if(centreId){
      res.locals.centre = centres[centreId];
      res.locals.centre.id = centreId;
  } else {
    res.locals.centre = centres["fiveways"];
    res.locals.centre.id = "fiveways";

  }
};

router.get('/assessment-centres', function(req, res, next){
  res.locals.centres = require(filePath +'/data/centres.js')
  next()
})

router.get('/ready-to-book', function(req, res, next){
  var customers = require(filePath +'/data/referrals.js')
  if(req.query.booked){
    customers = customers.filter(customer => customer._id !== req.query.booked);
  }
  res.locals.customers = customers;
  res.locals.customersTotal = customers.length;
  next()
})

router.get('/booked-appointments', function(req, res, next){
  var customers = require(filePath +'/data/booked.js');
  res.locals.customers = customers.map(customer => {

    var arrivedTime = moment(customer.appointmentTime, "h:mma");
    customer.timeArrived = arrivedTime.add(customer.arrivedTime, "minutes").format("h:mma");

    return customer;
  })
  next()
})

router.get('/booking/history', function(req, res, next){
    res.locals.comments = commentsData
    next()
  })

router.post('/booking/history', function(req, res, next){
    var time = new Date();
    res.locals.comments = commentsData


      res.locals.comments.push({
        comment: req.body.comment,
        timestamp: time.getTime(),
        dateFormatted: moment(time).format("dddd DD MMM YYYY hh:mm a"),
        name: "Shelia Hopper",
        hasComment: true,
        isCustomer: true
        })
      res.render(viewPath +'/booking/history');

  })
router.post('/booking/cancel-appointment', function(req, res, next){
    if(req.body.change_now === "true"){
      res.redirect('timepicker')
    } else {
      res.redirect('/fha/v' + versionNumber +'/appointments-changed?reason=' + req.body.reason)
    }

  })



router.post('/booking/bobby_timeline', function(req, res, next){
    var time = new Date();
    commentsData.push({
        timestamp: time.getTime(),
        dateFormatted: moment(time).format("dddd DD MMM YYYY hh:mm a"),
        name: "Shelia Hopper",
        hasComment: false,
        isCustomer: req.body.caller === "customer",
        authenticated: req.body.confirmed
        })
      res.render(viewPath +'/booking/bobby_timeline');

  })

router.get('/assessment-centres', function(req, res, next){
  res.locals.centres = require(filePath +'/data/centres.js')
  next()
})




router.get('/decision_maker', function(req, res, next){
  var customers = require(filePath +'/data/decisionMaker.js');
  res.locals.customers = customers.map(customer => {

    var arrivedTime = moment(customer.appointmentTime, "h:mma");
    customer.timeArrived = arrivedTime.add(customer.arrivedTime, "minutes").format("h:mma");

    return customer;
  })
  next()
})

router.get('/todays-appointments-*', function(req, res, next){
  var customers = require(filePath +'/data/todaysAppointments.js');
  res.locals.customers = customers.map(customer => {

    var arrivedTime = moment(customer.appointmentTime, "h:mma");
    customer.timeArrived = arrivedTime.add(customer.arrivedTime, "minutes").format("h:mma");
    
    return customer;
  })

 
  next()
})

router.get('/booking/referrals/:customerId*', function(req, res, next){
  var customers = require(filePath +'/data/referrals.js');

  res.locals.section = "referrals";
  res.locals.templatePath = res.locals.path+"/booking/_layout.html";
  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  next()
})



router.get('*/:customerId/appointment-details', function(req, res, next){
  res.locals.history = appointmentHistory.filter(entry => entry._id == req.params.customerId);
  console.log(res.locals.history);
  next()
})

router.get('/booking/referrals/:customerId', function(req, res, next){
  res.render(viewPath +'/booking/customer-referral');
})

router.get('/booking/booked/:customerId*', function(req, res, next){
  var customers = require(filePath +'/data/booked.js').concat(require(filePath +'/data/todaysAppointments.js'));

  res.locals.section = "booked";
  res.locals.templatePath = res.locals.path+"/booking/_layout-booking.html";

  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  next()
})



router.get('/booking/decision/:customerId/appointment-details', function(req, res, next){

  res.locals.history = appointmentHistory.filter(entry => entry._id === req.params.customerId);
  next()
})







router.post('/booking/booked/:customerId*', function(req, res, next){
  var customers = require(filePath +'/data/booked.js');
  var todaysCustomers = require(filePath +'/data/todaysAppointments.js');
  var allCustomers = customers.concat(todaysCustomers);

  res.locals.section = "booked";
  res.locals.templatePath = res.locals.path+"/booking/_layout-booking.html";

  res.locals.customer = allCustomers.filter(customer => customer._id === req.params.customerId)[0];
  next()
})

router.get('/booking/booked/:customerId', function(req, res, next){
  res.render(viewPath +'/booking/customer-booked');
})




router.get('/booking/decision/:customerId*', function(req, res, next){
  var customers = require(filePath +'/data/decisionMaker.js');

  res.locals.section = "decision";
  res.locals.templatePath = res.locals.path+"/booking/_layout-decision.html";
  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  next()
})

router.post('/booking/decision/:customerId*', function(req, res, next){
  var customers = require(filePath +'/data/decisionMaker.js');

  res.locals.section = "decision";
  res.locals.templatePath = res.locals.path+"/booking/_layout-decision.html";
  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  next()
})

router.get('/booking/decision/:customerId', function(req, res, next){
  res.render(viewPath +'/booking/customer-booked');
})

router.get('/booking/decision/:customerId/details', function(req, res, next){
  res.render(viewPath +'/booking/details/contact');
})

router.get('/booking/decision/:customerId/illness', function(req, res, next){
  res.render(viewPath +'/booking/details/illness');
})

router.get('/booking/decision/:customerId/gp', function(req, res, next){
  res.render(viewPath +'/booking/details/gp');
})

router.get('/booking/decision/:customerId/details', function(req, res, next){
  res.render(viewPath +'/booking/details/contact');
})

router.get('/booking/decision/:customerId/timeline', function(req, res, next){
  res.render(viewPath +'/booking/timeline');
})

router.get('/booking/decision/:customerId/evidence', function(req, res, next){
  res.render(viewPath +'/booking/evidence/index');
})


router.get('/booking/decision/:customerId/evidence/:page', function(req, res, next){
  res.render(viewPath +'/booking/evidence/' + req.params.page);
})

router.get('/booking/arrived/:customerId*', function(req, res, next){
  var customers = require(filePath +'/data/todaysAppointments.js');
  
  res.locals.section = "arrived";
  res.locals.templatePath = res.locals.path+"/booking/_layout-arrived.html";
  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  console.log(res.locals.customer);
  res.locals.customer.appointmentDate = moment().hours(14).minutes(0).format();
  res.locals.customer.originalAppointmentDate = res.locals.customer.appointmentDate;
  res.locals.customer.receivedDate = moment(res.locals.customer.originalAppointmentDate).subtract(14, "days");
  var appointmentTime = moment(res.locals.customer.appointmentTime, "h:mma");
  res.locals.customer.timeArrived = appointmentTime.add(res.locals.customer.arrivedTime, "minutes").format("h:mma");

  next()
})

router.post('/booking/arrived/:customerId*', function(req, res, next){
  var customers = require(filePath +'/data/todaysAppointments.js');
  
  res.locals.section = "arrived";
  res.locals.templatePath = res.locals.path+"/booking/_layout-arrived.html";
  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  console.log(res.locals.customer);
  var appointmentTime = moment(res.locals.customer.appointmentTime, "h:mma");
  res.locals.customer.timeArrived = appointmentTime.add(res.locals.customer.arrivedTime, "minutes").format("h:mma");

  next()
})

router.get('*/timepicker', function(req, res, next){
  var getAppointemnts = require(filePath +'/data/availableAppointments.js');
  var showAppointmentsAfter = 15;

  var showAppointmentsBefore = 0 - moment(res.locals.customer.appointmentDate).diff(moment(), "days");
  if(res.locals.query.changedBy == 'customer' && !res.locals.customer.ableToRearrange ){
    showAppointmentsAfter = 0;
  }
  var date = res.locals.customer.appointmentDate;

  if(res.locals.query.cshu == 'true') {
    date = moment().format();
    showAppointmentsBefore = 1;
  }
  console.log(res.locals.customer.ableToRearrange)
  console.log("diff: " + moment(res.locals.customer.appointmentDate).diff(moment(), "days"))
  console.log('showAppointmentsBefore: ' + showAppointmentsBefore)
  console.log('showAppointmentsAfter: ' + showAppointmentsAfter)
  console.log(date)

  var availableAppointments = getAppointemnts.generateAppointmentDates(date, showAppointmentsBefore, showAppointmentsAfter);
  
  if(!res.locals.query.number){
    res.locals.query.number = 4;
  }
  res.locals.availableAppointments = availableAppointments.filter(appointment => moment(appointment.appointmentDate).day() > 0 && moment(appointment.appointmentDate).day() < 6);
  res.locals.newNumber = parseInt(res.locals.query.number) + 4;
  next()
})

router.get('*/send-home-2', function(req, res, next){
  var availableAppointments = require(filePath +'/data/availableAppointments.js');
  
  if(!res.locals.query.number){
    res.locals.query.number = 4;
  }
  res.locals.availableAppointments = availableAppointments.filter(appointment => moment(appointment.appointmentDate).day() > 0 && moment(appointment.appointmentDate).day() < 6);
  res.locals.newNumber = parseInt(res.locals.query.number) + 4;
  next()
})





router.get('/booking/arrived/:customerId', function(req, res, next){
  res.render(viewPath +'/booking/customer-booked');
})

router.get('/booking/arrived/:customerId/appointment-details', function(req, res, next){

  res.locals.history = appointmentHistory.filter(entry => entry._id === req.params.customerId);

  res.render(viewPath +'/booking/appointment-details');
  
})

router.get('/booking/arrived/:customerId/details', function(req, res, next){
  res.render(viewPath +'/booking/details/contact');
})

router.get('/booking/arrived/:customerId/illness', function(req, res, next){
  res.render(viewPath +'/booking/details/illness');
})

router.get('/booking/arrived/:customerId/gp', function(req, res, next){
  res.render(viewPath +'/booking/details/gp');
})

router.get('/booking/arrived/:customerId/details', function(req, res, next){
  res.render(viewPath +'/booking/details/contact');
})

router.get('/booking/arrived/:customerId/timeline', function(req, res, next){
  res.render(viewPath +'/booking/timeline');
})

router.get('/booking/arrived/:customerId/evidence', function(req, res, next){
  res.render(viewPath +'/booking/evidence/index');
})


router.get('/booking/arrived/:customerId/evidence/:page', function(req, res, next){
  res.render(viewPath +'/booking/evidence/' + req.params.page);
})

router.get('/booking/arrived/:customerId/:pageName', function(req, res, next){
  res.render(viewPath +'/booking/' + req.params.pageName);
})




router.get('/booking/decision/:customerId/:page', function(req, res, next){

  res.render(viewPath +'/booking/' + req.params.page);
})


router.get('/assessment/evidence/typicalDay/:commentId', function(req, res, next){  
  res.locals.comment = typicalDayComments.filter(item => item.id === req.params.commentId)[0];


  res.render(viewPath +'/assessment/evidence/contentEditDay');
  
});



router.post('/assessment/evidence/typicalDayEdit', function(req, res, next){  
  
  typicalDayComments.map(function(item){
    if(item.id === req.body.id){
      item.comment = req.body.comment;
    }
  })
  console.log(typicalDayComments);
  req.session.data.typicalDayComments = typicalDayComments;
  
  next()
  
});


router.get('/assessment/evidence/socialWorkHistoryEdit/:commentId', function(req, res, next){  
  res.locals.comment = socialWorkComments.filter(item => item.id === req.params.commentId)[0];


  res.render(viewPath +'/assessment/evidence/contentEdit');
  
});



router.post('/assessment/evidence/socialWorkHistoryEdit', function(req, res, next){  
  
  socialWorkComments.map(function(item){
    if(item.id === req.body.id){
      item.comment = req.body.comment;
    }
  })
  console.log(socialWorkComments);
  req.session.data.socialWorkComments = socialWorkComments;
  
  next()
  
});

router.post('/assessment/evidence/socialWorkHistory', function(req, res, next){  
  if(req.body.delete == "true"){
     socialWorkComments = socialWorkComments.filter(item => item.id != req.body.id);

  } else {

    socialWorkComments.push({
      id: crypto.randomBytes(16).toString("hex"),
      comment: req.body.comments,
      time: moment().format()
    });

    res.locals.comments = socialWorkComments;
  }
  next()

});

router.post('/assessment/evidence/typicalDay', function(req, res, next){  
  if(req.body.delete == "true"){
     typicalDayComments = typicalDayComments.filter(item => item.id != req.body.id);

  } else {

    typicalDayComments.push({
      id: crypto.randomBytes(16).toString("hex"),
      comment: req.body.comments,
      time: moment().format()
    });

    res.locals.comments = typicalDayComments;
  }
  next()

});



router.get('/assessment/evidence/socialWorkHistory*', function(req, res, next){  
  res.locals.comments = socialWorkComments;
  next()
});

router.get('/assessment/evidence/typicalDay', function(req, res, next){  
  res.locals.comments = typicalDayComments;
  next()
});

router.get('/assessment/evidence/wca-index', function(req, res, next){  
  req.session.data.socialWorkComments = socialWorkComments;
  req.session.data.typicalDayComments = typicalDayComments;
  next()
});



router.post('/booking/booked/:customerId/request-rearrangement-post', function(req, res, next){  
  
  var changedByCustomer = req.body.changedByCustomer === 'yes' || false;
  req.session.apointmentHistory = {
      _id: req.params.customerId,
      entryDate: moment(new Date()).format(),
      comments: req.body.comments,
      changedByCustomer: changedByCustomer
    }
    
  if(req.body.changedByCustomer === 'no'){
    req.session.apointmentHistory.title = "Appointment cancelled by assessment centre";
    res.redirect(301, 'timepicker?changedBy=dwp');
  } else { 
    req.session.apointmentHistory.title = "Unable to attend";
    req.session.apointmentHistory.code = 'UTA';
    res.redirect(301, 'timepicker?changedBy=customer');
  }
});




router.post('/booking/decision/:customerId/decision-post', function(req, res, next){
  var title = `${res.locals.customer.decisionType} ${req.body.decision}`;
  appointmentHistory.push({
      _id: req.params.customerId,
      title: title,
      entryDate: moment(new Date()).format(),
    });

  res.locals.customer.decisionMade = req.body.decision;
  res.redirect(307, 'appointment-details');

});


router.post('/booking/arrived/:customerId/send-home-post', function(req, res, next){
  var comments = req.body.otherReason || req.body.reason;
  
  req.session.apointmentHistory = {
      _id: req.params.customerId,
      title: "Sent home unseen",
      entryDate: moment(new Date()).format(),
      comments: comments,
      appointmentDate: req.body.appointment,
      code: 'CSHU'
    }

  res.redirect(301, 'timepicker?reasonNeeded=false&cshu=true');

});

router.post('/booking/booked/:customerId/arrived-post', function(req, res, next){
  var comments = req.body.otherReason || req.body.reason;
  
  res.locals.arrivedTimeMoment = moment(new Date());
  arrivedTime = res.locals.arrivedTimeMoment.format("h:mm a");
  res.locals.customer.timeArrived = arrivedTime;
  res.locals.customer.arrivedTime = 1;
  res.locals.customer.waitTime = 1;
  res.locals.customer.arrived = true;

  appointmentHistory.push({
      _id: req.params.customerId,
      title: "Arrived at assessment centre at " + arrivedTime,
      entryDate: res.locals.arrivedTimeMoment.format(),
    })

  res.redirect(301, '/' + res.locals.path + '/booking/arrived/' + req.params.customerId + '/appointment-details');

});

router.post('*/:customerId/timepicker-post', function(req, res, next){
    if(req.body.appointment === "unableToBook"){
      var referrals = require(filePath +'/data/referrals.js');
      res.locals.customer.cshu = true;
      referrals.push(res.locals.customer);
      appointmentHistory.push(req.session.apointmentHistory);
      
      delete req.session.apointmentHistory;

      res.locals.customer.appointmentDate = undefined;

      res.redirect(302, '/' + res.locals.path + '/booking/referrals/' + req.params.customerId + '/appointment-details');

    } else {

    if(req.session.apointmentHistory.code === "UTA"){
      res.locals.customer.ableToRearrange = false;
      res.locals.customer.numberOfUta ++;
    } else if(req.session.apointmentHistory.code === "CSHU"){
      res.locals.customer.cshuNumber = res.locals.customer.cshuNumber ++ || 1;
    }

    appointmentHistory.push(req.session.apointmentHistory);

    
    appointmentHistory.push({
      _id: req.params.customerId,
      title: "Appointment Booked",
      entryDate: moment(new Date()).format(),
      appointmentDate: req.body.appointment
    })

    res.locals.customer.appointmentDate = req.body.appointment;
    delete req.session.apointmentHistory;

    var customers = require(filePath +'/data/booked.js');

    var inBooked = customers.filter(customer => customer._id === req.params.customerId).length > 0;
    console.log("in booked: " + inBooked)
    if(!inBooked){
      customers.push(res.locals.customer);
    }
    res.redirect(302, '/' + res.locals.path + '/booking/booked/' + req.params.customerId + '/appointment-details');
    }
  })



router.get('/booking/referrals/:customerId/gp', function(req, res, next){
  res.render(viewPath +'/booking/details/gp');
})

router.get('/booking/referrals/:customerId/illness', function(req, res, next){
  res.render(viewPath +'/booking/details/illness');
})

router.get('/booking/referrals/:customerId/details', function(req, res, next){
  res.render(viewPath +'/booking/details/contact');
})

router.get('/booking/referrals/:customerId/timeline', function(req, res, next){
  res.render(viewPath +'/booking/timeline');
})

router.get('/booking/referrals/:customerId/appointment-details', function(req, res, next){
  res.render(viewPath +'/booking/appointment-details');
})

router.get('/booking/referrals/:customerId/evidence', function(req, res, next){
  res.render(viewPath +'/booking/evidence/index');
})


router.get('/booking/referrals/:customerId/evidence/:page', function(req, res, next){
  res.render(viewPath +'/booking/evidence/' + req.params.page);
})


router.get('/booking/booked/:customerId/evidence/:page', function(req, res, next){
  res.render(viewPath +'/booking/evidence/' + req.params.page);
})

router.get('/booking/booked/:customerId/illness', function(req, res, next){
  res.render(viewPath +'/booking/details/illness');
})



router.get('/booking/booked/:customerId/gp', function(req, res, next){
  res.render(viewPath +'/booking/details/gp');
})


router.get('/booking/booked/:customerId/today', function(req, res, next){
  res.render(viewPath +'/booking/details/today');
})
router.get('/booking/arrived/:customerId/send-home', function(req, res, next){
  var appointmentTime = moment(res.locals.customer.appointmentTime, "h:mma");
  res.locals.customer.timeArrived = appointmentTime.add(res.locals.customer.arrivedTime, "minutes").format("h:mma");
  next()
})



router.get('/booking/booked/:customerId/details', function(req, res, next){
  res.render(viewPath +'/booking/details/contact');
})

router.get('/booking/booked/:customerId/timeline', function(req, res, next){
  res.render(viewPath +'/booking/timeline_booked');
})

router.post('/booking/booked/mendez/mendez_timeline-arrived', function(req, res, next){

    res.locals.arrivedTimeMoment = moment(new Date());;
    arrivedTime = res.locals.arrivedTimeMoment.format("h:mm a");
    res.locals.arrivedTime = arrivedTime;

    res.render(viewPath +'/booking/mendez_timeline-arrived');
  })

router.post('/booking/booked/:customerId/timeline-arrived', function(req, res, next){
    var customers = require(filePath +'/data/booked.js');
    res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  
    var arrivedTimeMoment = moment(new Date());;
    res.locals.customer.timeArrived = arrivedTimeMoment.format("h:mm a");


    res.render(viewPath +'/booking/timeline-arrived');
  })




router.get('/booking/booked/mendez/*', function(req, res, next){

    var startTime = moment(res.locals.arrivedTime, 'hh:mma');
    var endTime = moment(new Date(), 'hh:mm:ss a');

    var totalHours = (endTime.diff(startTime, 'hours'));
    var totalMinutes = endTime.diff(startTime, 'minutes');
    var clearMinutes = totalMinutes % 60;
    res.locals.waitTime = totalMinutes //totalHours + " hours and " + clearMinutes + " minutes";
    next()
  })




router.post('/booking/arrived/:customerId/send-home-2', function(req, res, next){
  res.locals.postData = req.body;
  var reason = req.body.otherReason || req.body.reason;
  appointmentHistory.push({
    _id: req.params.customerId,
    title: "Sent home unseen",
    comments: reason,
    entryDate: moment(new Date()).format(),
    appointmentDate: null,
    changedByCustomer: false
  });

  next()
})

router.get('/booking/booked/:customerId/evidence', function(req, res, next){
  res.render(viewPath +'/booking/evidence/index');
})


router.get('/booking/booked/:customerId/:pageName', function(req, res, next){
  res.render(viewPath +'/booking/' + req.params.pageName);
})


router.get('/capacity/manage-centre/:centreId*', function(req, res, next){
  getCentreDetails(req, res)
  res.locals.staff = require(filePath +'/data/staff.js')
  next()
})

router.post('/capacity/manage-centre/:centreId*', function(req, res, next){
  getCentreDetails(req, res)
  res.locals.staff = require(filePath +'/data/staff.js')
  next()
})


router.get('/capacity/manage-centre/:centreId', function(req, res, next){
  res.render(viewPath +'/capacity/manage-centre/index')
})

router.get('/capacity/manage-centre/:centreId/:section*', function(req, res, next){
  res.locals.selectedTab = req.params.section;
  next()
})

router.post('/capacity/manage-centre/:centreId/:section*', function(req, res, next){
  res.locals.selectedTab = req.params.section;
  next()
})

router.get('/capacity/manage-centre/:centreId/manage-staff', function(req, res, next){
    res.locals.staffTotals = {};
    res.locals.staffTotals.complex = res.locals.staff.filter(staff => staff.skill === "Complex Neuro").length;
    res.locals.staffTotals.neuro = res.locals.staff.filter(staff => staff.skill === "Neuro").length;;
    res.locals.staffTotals.standard = res.locals.staff.filter(staff => staff.skill === "Standard").length;
    res.locals.staffTotals.scrutiny = res.locals.staff.filter(staff => staff.scrutinyPaperwork).length;
    res.locals.staffTotals.total = res.locals.staff.length;

  //
  res.render(viewPath +'/capacity/manage-staff/index');
})



router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId*', function(req, res, next){
  var staff = require(filePath +'/data/staff.js');

  res.locals.person = staff.filter(person => person.id === req.params.staffId)[0];
  var today = moment(new Date(2018,8,9));
  var year = today.year();
  var month = today.month() + 1;
  res.locals.calendar  = new calendar.Calendar(0).monthdatescalendar(2018, 8);
  res.locals.today = today.format();
  next()
})

router.post('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId*', function(req, res, next){
  var staff = require(filePath +'/data/staff.js');

  res.locals.person = staff.filter(person => person.id === req.params.staffId)[0];
  var today = moment(new Date(2018,8,9));
  var year = today.year()
  var month = today.month() + 1;
  res.locals.calendar  = new calendar.Calendar(0).monthdatescalendar(2018, 8);
  res.locals.today = today.format();
  next()
})

router.post('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId/staff-availability-2', function(req, res, next){
  res.locals.formData = req.body;
  res.render(viewPath +'/capacity/manage-staff/staff-availability-2');
  })

router.post('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId/staff-profile-2', function(req, res, next){
  
  res.locals.formData = req.body;
  
  res.render(viewPath +'/capacity/manage-staff/staff-profile-2');
  })


router.get('/capacity/manage-centre/:centreId/capacity-overbooked', function(req, res, next){

  res.locals.staff = require(filePath +'/data/staff-overbooked.js');

  next();
}) 



router.get('/capacity/manage-centre/:centreId', function(req, res, next){
  res.render(viewPath +'/capacity/manage-centre/index')
})

router.get('/capacity/manage-centre/:centreId/:section*', function(req, res, next){
  res.locals.selectedTab = req.params.section;
  next()
})

router.get('/capacity/manage-centre/:centreId/manage-staff', function(req, res, next){
    res.locals.staffTotals = {};
    res.locals.staffTotals.complex = res.locals.staff.filter(staff => staff.skill === "Complex Neuro").length;
    res.locals.staffTotals.neuro = res.locals.staff.filter(staff => staff.skill === "Neuro").length;;
    res.locals.staffTotals.standard = res.locals.staff.filter(staff => staff.skill === "Standard").length;
    res.locals.staffTotals.scrutiny = res.locals.staff.filter(staff => staff.scrutinyPaperwork).length;
    res.locals.staffTotals.total = res.locals.staff.length;

  //
  res.render(viewPath +'/capacity/manage-staff/inde');
})




router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId*', function(req, res, next){
  var staff = require(filePath +'/data/staff.js');

  res.locals.person = staff.filter(person => person.id === req.params.staffId)[0];
  next()
})


router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId', function(req, res, next){
  res.render(viewPath +'/capacity/manage-staff/staff-profile');
})

router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId/:section', function(req, res, next){
  res.render(viewPath +'/capacity/manage-staff/' + req.params.section);
})

router.get('/capacity/manage-centre/:centreId/capacity-overbooked', function(req, res, next){

  res.locals.staff = require(filePath +'/data/staff-overbooked.js');

  next();
})  

router.get('/capacity/manage-centre/:centreId/capacity*', function(req, res, next){
  res.locals.selectedTab = "capacity";

  res.locals.staffTotals = {}
  res.locals.staffTotals.available = res.locals.staff.filter(function(obj){
    if(obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny){
      return false;
    } else {
      return obj.days[req.query.day].available
    }
  }).length;

  var totalAppointments = 0;

  slotsData[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots);
  res.locals.totalAppointments = totalAppointments;
  res.locals.slots = slotsData[req.query.day];
  res.locals.totalSlots = slotsData[req.query.day].length;

  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots;
  res.render("fha/v' + versionNumber +'/capacity/manage-centre/capacity");
})

router.get('/capacity/manage-centre/:centreId/details', function(req, res, next){
  res.render(viewPath +'/capacity/manage-centre/index')
})

router.get('/capacity/manage-centre/:centreId/slots', function(req, res, next){
  res.render(viewPath +'/capacity/manage-centre/index')
})
router.get('/capacity/manage-centre/:centreId/rooms', function(req, res, next){
  res.render(viewPath +'/capacity/manage-centre/index')
})

router.get('/capacity/manage-centre/:centreId/:section', function(req, res, next){
  res.render(viewPath +'/capacity/manage-centre/' + req.params.section)
})

router.post('/capacity/manage-centre/:centreId/manage-staff/new-staff-skill', function(req, res, next){
  res.locals.person = {
    name: req.body.name,
    phone: req.body.phone,
    mobile: req.body.mobile,
    email: req.body.email
  }
  res.render(viewPath +'/capacity/manage-staff/new-staff-skill');
});

router.post('/capacity/manage-centre/:centreId/manage-staff/new-staff-hours', function(req, res, next){
  res.locals.person = {
    name: req.body.name,
    phone: req.body.phone,
    mobile: req.body.mobile,
    email: req.body.email,
    scrutiny: req.body.scrutiny,
    skill: req.body.skill 
  } ; 
  res.render(viewPath +'/capacity/manage-staff/new-staff-hours');
});

router.post('/assessment-centres', function(req, res, next){
  res.locals.centres = require(filePath +'/data/centres.js')
  var centre = {
    name: req.body.name,
    location: req.body.location
  };
  res.locals.centres[centre.name] = centre; 
  res.render(viewPath +'/assessment-centres');
});

router.post('/capacity/new-centre-2', function(req, res, next){
  res.locals.centre = {
    name: req.body.name,
    location: req.body.location
  } ; 
  res.render(viewPath +'/capacity/new-centre-2');
});

router.post('/capacity/new-centre-3', function(req, res, next){
  res.locals.centre = {
    name: req.body.name,
    location: req.body.location
  } ; 
  res.render(viewPath +'/capacity/new-centre-3');
});




router.post('/capacity/manage-centre/:centreId/manage-staff/', function(req, res, next){
  var scrutiny = req.body.scrutiny === "true";
  res.locals.person = {
    name: req.body.name,
    phone: req.body.phone,
    mobile: req.body.mobile,
    email: req.body.email,
    scrutinyPaperwork: scrutiny,
    skill: req.body.skill 
  }; 
  res.locals.staff.push(res.locals.person)
  res.locals.query.tab = "staff";

  res.locals.staffTotals = {};
    res.locals.staffTotals.complex = res.locals.staff.filter(staff => staff.skill === "Complex Neuro").length;
    res.locals.staffTotals.neuro = res.locals.staff.filter(staff => staff.skill === "Neuro").length;;
    res.locals.staffTotals.standard = res.locals.staff.filter(staff => staff.skill === "Standard").length;
    res.locals.staffTotals.scrutiny = res.locals.staff.filter(staff => staff.scrutinyPaperwork).length;
    res.locals.staffTotals.total = res.locals.staff.length;

  res.render(viewPath +'/capacity/manage-staff/index');
});

router.get('/capacity/manage-centre/:centreId/manage-staff/:section', function(req, res, next){
  res.render(viewPath +'/capacity/manage-staff/' + req.params.section)
});

router.post('/capacity/manage-centre/:centreId/edit-centre-3', function(req, res, next){
  if(req.body["available-days-Saturday"] === "on"){
    res.locals.saturday = true;
  } else {
    res.locals.saturday = false;
  }
  res.render(viewPath +'/capacity/manage-centre/edit-centre-3');
})

router.post('/capacity/manage-centre/:centreId/details', function(req, res, next){
  res.locals.centre.details = req.body.details;
  if(req.body.saturday == "true"){
    res.locals.centre.openingTimes[5] = {
        "day": "Saturday",
        "open": "10:00am - 3:00pm"
      }
  } else {
    res.locals.centre.openingTimes[5] = {
        "day": "Saturday",
        "open": "Closed"
      }
  }
  res.render(viewPath +'/capacity/manage-centre/index');
})





router.get('/capacity/manage-centre/capacity', function(req, res, next){

  res.locals.staffTotals = {}
  res.locals.staffTotals.available = staffData.filter(function(obj){
    if(obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny){
      return false;
    } else {
      return obj.days[req.query.day].available
    }
  }).length;

  var totalAppointments = 0;

  slotsData[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots);
  res.locals.totalAppointments = totalAppointments;
  res.locals.slots = slotsData[req.query.day];
  res.locals.totalSlots = slotsData[req.query.day].length;

  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots;
  
  next();
});


router.get('/capacity/manage-centre/capacity-edit-slots', function(req, res, next){

  res.locals.staffTotals = {}
  res.locals.staffTotals.available = staffData.filter(function(obj){
    if(obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny){
      return false;
    } else {
      return obj.days[req.query.day].available
    }
  }).length;

  var totalAppointments = 0;

  slotsData[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots);
  res.locals.totalAppointments = totalAppointments;
  res.locals.slots = slotsData[req.query.day];
  res.locals.totalSlots = slotsData[req.query.day].length;

  
  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots;
  next();
});

router.get('/capacity/manage-centre/capacity-holiday', function(req, res, next){
  res.locals.staff = staffDataHoliday;
  res.locals.staffTotals = {}
  res.locals.staffTotals.available = staffDataHoliday.filter(function(obj){
    if(obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny){
      return false;
    } else {
      return obj.days[req.query.day].available
    }
  }).length;

  var totalAppointments = 0;

  slotsData[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots);
  res.locals.totalAppointments = totalAppointments;
  res.locals.slots = slotsData[req.query.day];
  res.locals.totalSlots = slotsData[req.query.day].length;
  
  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots;
  
  next();
});

router.get('/capacity/manage-centre/capacity-2', function(req, res, next){
  res.locals.staff = staffData2;
  res.locals.staffTotals = {}
  res.locals.staffTotals.available = staffData2.filter(function(obj){
    if(obj.scrutinyPaperwork && obj.days[req.query.day].scrutiny){
      return false;
    } else {
      return obj.days[req.query.day].available
    }
  }).length;

  var totalAppointments = 0;

  slotsData2[req.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots);
  res.locals.totalAppointments = totalAppointments;
  res.locals.slots = slotsData2[req.query.day];
  res.locals.totalSlots = slotsData2[req.query.day].length;

  if(req.query.day == "thursday"){
  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots - 11;
  } else {
  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots;
  }
  next();
});


router.get('/assessment/general-observations', function(req, res, next){
  res.locals.comments = observations
  next()
})

router.post('/assessment/general-observations-post', function(req, res, next){
  var time = new Date();
  res.locals.comments = observations


    res.locals.comments.push({
      comment: req.body.comment,
      timestamp: time.getTime(),
      dateFormatted: moment(time).format("dddd DD MMM YYYY hh:mm a"),
      name: "Shelia Hopper",
      hasComment: true,
      isCustomer: true
      })
    res.redirect(301, '/fha/v' + versionNumber +'/assessment/general-observations');

})





module.exports = router
