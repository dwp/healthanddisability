var express = require('express')
var router = express.Router()
var path = require('path')
var request = require('request')
var tog = require('../../../../lib/tog.js')
var staffDataHoliday = require('../../../../app/views/appoint/v12/staff-data-holiday.js')
var staffData2 = require('../../../../app/views/appoint/v12/staff-data-2.js')
var slotsData = require('../../../../app/views/appoint/v12/slots-data.js')
var slotsData2 = require('../../../../app/views/appoint/v12/slots-data-2.js')
var moment = require('moment')
console.log(path)

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
  res.locals.root = "/appoint/v12"
  res.locals.manageStaffPath = "appoint/v12/capacity/manage-staff"
  res.locals.path1 = res.locals.path + "/" + bits[0]
  res.locals.path2 = res.locals.path + "/" + bits[0] + "/" + bits[1]
  res.locals.stage = req.cookies.stage || 1;
  res.locals.query = req.query;
  res.locals.arrivedTime = arrivedTime;

  //res.locals.staff = staffData;
  res.locals.appointments = getAppointmentDates();


  next()
})

router.post('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.root = "/appoint/v12"
  res.locals.manageStaffPath = "appoint/v12/capacity/manage-staff"
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
      res.redirect('/appoint/v12/appointments-changed?reason=' + req.body.reason)
    }

  })


function getCentreDetails(req, res){
  var centres = require('../../../../app/views/appoint/v12/data/centres.js'),
        centreId = req.params.centreId;

  if(centreId){
      res.locals.centre = centres[centreId];
      res.locals.centre.id = centreId;
  } else {
    res.locals.centre = centres["fiveways"];
    res.locals.centre.id = "fiveways";

  }
};

router.get('/appointment-centres', function(req, res, next){
  res.locals.centres = require('../../../../app/views/appoint/v12/data/centres.js')
  next()
})

router.get('/appointments', function(req, res, next){
  var customers = require('../../../../app/views/appoint/v12/data/referrals.js')
  if(req.query.booked){
    customers = customers.filter(customer => customer._id !== req.query.booked);
  }
  res.locals.customers = customers;
  next()
})

router.get('/booked_appointments', function(req, res, next){
  var customers = require('../../../../app/views/appoint/v12/data/booked.js');
  res.locals.customers = customers.map(customer => {

    var arrivedTime = moment(customer.appointmentTime, "h:mma");
    customer.timeArrived = arrivedTime.add(customer.arrivedTime, "minutes").format("h:mma");

    return customer;
  })
  next()
})

router.get('/todays_appointments', function(req, res, next){
  var customers = require('../../../../app/views/appoint/v12/data/todaysAppointments.js');
  res.locals.customers = customers.map(customer => {

    var arrivedTime = moment(customer.appointmentTime, "h:mma");
    customer.timeArrived = arrivedTime.add(customer.arrivedTime, "minutes").format("h:mma");
    
    return customer;
  })

 
  next()
})

router.get('/booking/referrals/:customerId*', function(req, res, next){
  var customers = require('../../../../app/views/appoint/v12/data/referrals.js');

  res.locals.section = "referrals";
  res.locals.templatePath = res.locals.path+"/booking/_layout.html";
  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  next()
})

router.get('/booking/referrals/:customerId', function(req, res, next){
  res.render("appoint/v12/booking/customer-referral");
})

router.get('/booking/booked/:customerId*', function(req, res, next){
  var customers = require('../../../../app/views/appoint/v12/data/booked.js').concat(require('../../../../app/views/appoint/v12/data/todaysAppointments.js'));

  res.locals.section = "booked";
  res.locals.templatePath = res.locals.path+"/booking/_layout-booking.html";

  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  next()
})

router.post('/booking/booked/:customerId*', function(req, res, next){
  var customers = require('../../../../app/views/appoint/v12/data/booked.js');

  res.locals.section = "booked";
  res.locals.templatePath = res.locals.path+"/booking/_layout-booking.html";

  res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  next()
})

router.get('/booking/booked/:customerId', function(req, res, next){
  res.render("appoint/v12/booking/customer-booked");
})

router.get('/booking/referrals/:customerId/illness', function(req, res, next){
  res.render("appoint/v12/booking/details/illness");
})

router.get('/booking/referrals/:customerId/gp', function(req, res, next){
  res.render("appoint/v12/booking/details/gp");
})

router.get('/booking/referrals/:customerId/details', function(req, res, next){
  res.render("appoint/v12/booking/details/contact");
})

router.get('/booking/referrals/:customerId/timeline', function(req, res, next){
  res.render("appoint/v12/booking/timeline");
})

router.get('/booking/referrals/:customerId/evidence', function(req, res, next){
  res.render("appoint/v12/booking/evidence/index");
})


router.get('/booking/referrals/:customerId/evidence/:page', function(req, res, next){
  res.render("appoint/v12/booking/evidence/" + req.params.page);
})


router.get('/booking/booked/:customerId/evidence/:page', function(req, res, next){
  res.render("appoint/v12/booking/evidence/" + req.params.page);
})

router.get('/booking/booked/:customerId/illness', function(req, res, next){
  res.render("appoint/v12/booking/details/illness");
})

router.get('/booking/booked/:customerId/gp', function(req, res, next){
  res.render("appoint/v12/booking/details/gp");
})

router.get('/booking/booked/:customerId/arrived', function(req, res, next){
  var appointmentTime = moment(res.locals.customer.appointmentTime, "h:mma");
  res.locals.customer.timeArrived = appointmentTime.add(res.locals.customer.arrivedTime, "minutes").format("h:mma");
  res.render("appoint/v12/booking/details/arrived");
})
router.get('/booking/booked/:customerId/today', function(req, res, next){
  res.render("appoint/v12/booking/details/today");
})
router.get('/booking/booked/:customerId/send-home', function(req, res, next){
  var appointmentTime = moment(res.locals.customer.appointmentTime, "h:mma");
  res.locals.customer.timeArrived = appointmentTime.add(res.locals.customer.arrivedTime, "minutes").format("h:mma");
  next()
})

router.post('/booking/booked/:customerId/send-home-2', function(req, res, next){
  res.locals.postData = req.body;
  res.render("appoint/v12/booking/send-home-2");
})

router.get('/booking/booked/:customerId/details', function(req, res, next){
  res.render("appoint/v12/booking/details/contact");
})

router.get('/booking/booked/:customerId/timeline', function(req, res, next){
  res.render("appoint/v12/booking/timeline");
})

router.post('/booking/booked/mendez/mendez_timeline-arrived', function(req, res, next){

    res.locals.arrivedTimeMoment = moment(new Date());;
    arrivedTime = res.locals.arrivedTimeMoment.format("h:mm a");
    res.locals.arrivedTime = arrivedTime;

    res.render("appoint/v12/booking/mendez_timeline-arrived");
  })

router.post('/booking/booked/:customerId/timeline-arrived', function(req, res, next){
    var customers = require('../../../../app/views/appoint/v12/data/booked.js');
    res.locals.customer = customers.filter(customer => customer._id === req.params.customerId)[0];
  
    var arrivedTimeMoment = moment(new Date());;
    res.locals.customer.timeArrived = arrivedTimeMoment.format("h:mm a");


    res.render("appoint/v12/booking/timeline-arrived");
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

router.get('*/timepicker', function(req, res, next){
  var availableAppointments = require('../../../../app/views/appoint/v12/data/availableAppointments.js');
  
  if(!res.locals.query.number){
    res.locals.query.number = 4;
  }
  res.locals.availableAppointments = availableAppointments.filter(appointment => moment(appointment.appointmentDate).day() > 0 && moment(appointment.appointmentDate).day() < 6);
  res.locals.newNumber = parseInt(res.locals.query.number) + 4;
  next()
})

router.get('/booking/booked/:customerId/evidence', function(req, res, next){
  res.render("appoint/v12/booking/evidence/index");
})


router.get('/booking/booked/:customerId/:pageName', function(req, res, next){
  res.render("appoint/v12/booking/" + req.params.pageName);
})



router.get('/capacity/manage-centre/:centreId*', function(req, res, next){
  getCentreDetails(req, res)
  res.locals.staff = require('../../../../app/views/appoint/v12/data/staff.js')
  next()
})



router.get('/capacity/manage-centre/:centreId', function(req, res, next){
  res.render("appoint/v12/capacity/manage-centre/index")
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
  res.render("appoint/v12/capacity/manage-staff/index");
})




router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId*', function(req, res, next){
  var staff = require('../../../../app/views/appoint/v12/data/staff.js');

  res.locals.person = staff.filter(person => person.id === req.params.staffId)[0];
  next()
})


router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId', function(req, res, next){
  res.render("appoint/v12/capacity/manage-staff/staff-profile");
})

router.get('/capacity/manage-centre/:centreId/manage-staff/staff-profile/:staffId/:section', function(req, res, next){
  res.render("appoint/v12/capacity/manage-staff/" + req.params.section);
})

router.get('/capacity/manage-centre/:centreId/capacity', function(req, res, next){
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
  res.render("appoint/v12/capacity/manage-centre/capacity");
})

router.get('/capacity/manage-centre/:centreId/details', function(req, res, next){
  res.render("appoint/v12/capacity/manage-centre/index")
})

router.get('/capacity/manage-centre/:centreId/slots', function(req, res, next){
  res.render("appoint/v12/capacity/manage-centre/index")
})
router.get('/capacity/manage-centre/:centreId/rooms', function(req, res, next){
  res.render("appoint/v12/capacity/manage-centre/index")
})

router.get('/capacity/manage-centre/:centreId/:section', function(req, res, next){
  res.render("appoint/v12/capacity/manage-centre/" + req.params.section)
})

router.get('/capacity/manage-centre/:centreId/manage-staff/new-staff-hours', function(req, res, next){
  res.locals.person = require('../../../../app/views/appoint/v12/data/new-staff.js');
  next()
});

router.get('/capacity/manage-centre/:centreId/manage-staff/:section', function(req, res, next){
  res.render("appoint/v12/capacity/manage-staff/" + req.params.section)
});









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

router.get('/miarussell/*', function (req, res, next) {
  res.locals.firstname = "Mia"
  next()
})


router.get('/cookies/', function (req, res, next) {
  res.send(tog(req.cookies));
})

module.exports = router
