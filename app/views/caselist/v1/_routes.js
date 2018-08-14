var express = require('express')
var router = express.Router()
var path = require('path')
var moment = require('moment')
var _ = require('lodash')
var tog = require('../../../../lib/tog.js')

router.get('*', function (req, res, next) {
  // path is only available with the proper value within this sub-module/router.
  res.locals.path = req.baseUrl.substr(1)
  // create some other useful path variables.
  var bits = req.params[0].substr(1).split('/')
  res.locals.path1 = res.locals.path + "/" + bits[0]
  res.locals.path2 = res.locals.path + "/" + bits[0] + "/" + bits[1]
  res.locals.stage = 1;
  res.locals.query = req.query;
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



module.exports = router
