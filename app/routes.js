var express = require('express')
var router = express.Router()
var path = require('path')

router.get('*', function (req, res, next) {
  res.locals.debug = {};
  next();
})

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// add your routes here

module.exports = router


// Filter AC from all to tresco
router.post("/fha/appointment-scenarios/scenario4/dashboard/decision-post", function(req, res, next){

	if(req.body['filter-assess'] === 'all-assess'){
		res.redirect(`/fha/appointment-scenarios/scenario4/dashboard`);
	} else if(req.body['filter-assess'] === 'tresco'){
		res.redirect(`/fha/appointment-scenarios/scenario4/dashboard-tresco`);
	} else {
		res.redirect(`/fha/appointment-scenarios/scenario4/dashboard`);
	}
	next();

});


// Filter AC from tresco to all
router.post("/fha/appointment-scenarios/scenario4/dashboard-tresco/decision-post", function(req, res, next){

	if(req.body['filter-assess'] === 'all-assess'){
		res.redirect(`/fha/appointment-scenarios/scenario4/dashboard`);
	} else if(req.body['filter-assess'] === 'tresco'){
		res.redirect(`/fha/appointment-scenarios/scenario4/dashboard-tresco`);
	} else {
		res.redirect(`/fha/appointment-scenarios/scenario4/dashboard`);
	}
	next();

});
