var express = require('express')
var router = express.Router()
var path = require('path')
var request = require('request')
var tog = require('../../../../lib/tog.js')
var staffDataHoliday = require('../../../../app/views/appoint/v11/staff-data-holiday.js')
var staffData2 = require('../../../../app/views/appoint/v11/staff-data-2.js')
var slotsData = require('../../../../app/views/appoint/v11/slots-data.js')
var slotsData2 = require('../../../../app/views/appoint/v11/slots-data-2.js')
var moment = require('moment')
var commentsData = require('../../../../app/views/appoint/v11/data/comments.js');

console.log(path)

router.get('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.root = "/appoint/v11"
  res.locals.manageStaffPath = "appoint/v11/capacity/manage-staff"
  res.locals.path1 = res.locals.path + "/" + bits[0]
  res.locals.path2 = res.locals.path + "/" + bits[0] + "/" + bits[1]
  res.locals.stage = req.cookies.stage || 1;
  res.locals.query = req.query;
  //res.locals.staff = staffData;
  next()
})

router.post('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.root = "/appoint/v11"
  res.locals.manageStaffPath = "appoint/v11/capacity/manage-staff"
  res.locals.path1 = res.locals.path + "/" + bits[0]
  res.locals.path2 = res.locals.path + "/" + bits[0] + "/" + bits[1]
  res.locals.stage = req.cookies.stage || 1;
  res.locals.query = req.query;
  //res.locals.staff = staffData;
  next()
})

function getCentreDetails(req, res){
  var centres = require('../../../../app/views/appoint/v11/data/centres.js'),
        centreId = req.params.centreId;

  if(centreId){
      res.locals.centre = centres[centreId];
      res.locals.centre.id = centreId;
  } else {
    res.locals.centre = centres["fiveways"];
    res.locals.centre.id = "fiveways";

  }
};


router.get('/booked_appointments', function(req, res, next){
    res.locals.appointments = require('../../../../app/views/appoint/v11/data/appointments.js')
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
      res.render("appoint/v11/booking/history");

  })
router.post('/booking/cancel-appointment', function(req, res, next){
    if(req.body.change_now === "true"){
      res.redirect('timepicker')
    } else {
      res.redirect('/appoint/v11/appointments-changed?reason=' + req.body.reason)
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
      res.render("appoint/v11/booking/bobby_timeline");

  })

router.get('/appointment-centres', function(req, res, next){
  res.locals.centres = require('../../../../app/views/appoint/v11/data/centres.js')
  next()
})



router.get('/capacity/manage-centre/:centreId*', function(req, res, next){
  getCentreDetails(req, res)
  res.locals.staff = require('../../../../app/views/appoint/v11/data/staff.js')
  next()
})



router.get('/capacity/manage-centre/:centreId', function(req, res, next){
  res.render("appoint/v11/capacity/manage-centre/index")
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
  res.render("appoint/v11/capacity/manage-staff/index");
})




router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId*', function(req, res, next){
  var staff = require('../../../../app/views/appoint/v11/data/staff.js');

  res.locals.person = staff.filter(person => person.id === req.params.staffId)[0];
  next()
})


router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId', function(req, res, next){
  res.render("appoint/v11/capacity/manage-staff/staff-profile");
})

router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId/:section', function(req, res, next){
  res.render("appoint/v11/capacity/manage-staff/" + req.params.section);
})

router.get('/capacity/manage-centre/:centreId/capacity-overbooked', function(req, res, next){

  res.locals.staff = require('../../../../app/views/appoint/v11/data/staff-overbooked.js');

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
  res.render("appoint/v11/capacity/manage-centre/capacity");
})




router.get('/capacity/manage-centre/:centreId/details', function(req, res, next){
  res.render("appoint/v11/capacity/manage-centre/index")
})

router.get('/capacity/manage-centre/:centreId/slots', function(req, res, next){
  res.render("appoint/v11/capacity/manage-centre/index")
})
router.get('/capacity/manage-centre/:centreId/rooms', function(req, res, next){
  res.render("appoint/v11/capacity/manage-centre/index")
})

router.get('/capacity/manage-centre/:centreId/:section', function(req, res, next){
  res.render("appoint/v11/capacity/manage-centre/" + req.params.section)
})

router.get('/capacity/manage-centre/:centreId/manage-staff/new-staff-hours', function(req, res, next){
  res.locals.person = require('../../../../app/views/appoint/v11/data/new-staff.js');
  next()
});

router.get('/capacity/manage-centre/:centreId/manage-staff/:section', function(req, res, next){
  res.render("appoint/v11/capacity/manage-staff/" + req.params.section)
});



router.get('/booking/timepicker', function(req, res, next){
  slotsData = require('../../../../app/views/appoint/v11/slots-data-booking.js')

  getCentreDetails(req, res)
  res.locals.staff = require('../../../../app/views/appoint/v11/data/staff.js')
  res.locals.staffTotals = {}
  res.locals.query.day = req.query.day || "monday";
  res.locals.slots = slotsData[res.locals.query.day];

  res.locals.staffTotals.available = res.locals.staff.filter(function(obj){
    if(obj.scrutinyPaperwork && obj.days[res.locals.query.day].scrutiny){
      return false;
    } else {
      return obj.days[res.locals.query.day].available
    }
  }).length;

  var totalAppointments = 0;

  slotsData[res.locals.query.day].map(day => totalAppointments = totalAppointments + day.usedSlots);
  res.locals.totalAppointments = totalAppointments;
  res.locals.slots = slotsData[res.locals.query.day];
  res.locals.totalSlots = slotsData[res.locals.query.day].length;

  res.locals.totalAvailableAppointments = res.locals.staffTotals.available * res.locals.totalSlots;

  next()
})



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

router.get('/miarussell/*', function (req, res, next) {
  res.locals.firstname = "Mia"
  next()
})


router.get('/cookies/', function (req, res, next) {
  res.send(tog(req.cookies));
})

module.exports = router
