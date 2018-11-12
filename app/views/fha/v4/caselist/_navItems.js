
module.exports = function(versionNumber, reviewCustomers, appointmentCustomers){


	return [{
		url:"referrals",
		label:"Referrals", 
		quantity: 49,
		subItems: [{
			url: "new-referrals",
			label: "New referrals",
			quantity: 32
		},{
			url: "uc50-posted",
			label: "UC50 posted",
			quantity: 9
		},{
			url: "uc50-received",
			label: "UC50 received",
			quantity: 8
		}]
	},{
		url:"review",
		label:"Reviews", 
		quantity: reviewCustomers.length,
		subItems: [{
			url: "ready-for-review",
			label: "Ready for review",
			quantity: reviewCustomers.filter(customer => customer.status === "review").length
		},{
			url: "requested-medical-evidence",
			label: "Requested medical evidence",
			quantity: reviewCustomers.filter(customer => customer.status === "fme").length
			
		}]
	},{
		url:"appointments",
		label:"Appointments", 
		quantity: 46,
		subItems: [{
			url: "ready-to-book",
			label: "Ready to book",
			quantity: 21
		},{
			url: "booked-appointments",
			label: "Booked appointments",
			quantity: 26
		}]
	},{
		url:"assessment",
		label:"Ready for Assessment", 
		quantity: 4,

	}]
}