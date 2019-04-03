
module.exports = function(versionNumber, dmCustomers){


	return [{
		url:"decision-maker",
		label:"Make a decision", 
		quantity: dmCustomers.length,
		subItems: [{
			url: "assessment-reports",
			label: "Completed assessment",
			quantity:dmCustomers.filter(customer => customer.status === "Assessment reports").length
		},{
			url: "failed-to-attend",
			label: "Failure to attend",
			quantity: dmCustomers.filter(customer => customer.status === "Failed to attend appointment").length
		}
	    ,{
			url: "good-cause",
			label: "Questionnaire not returned",
			quantity: dmCustomers.filter(customer => customer.status === "Questionnaire not returned").length
		}]
	}
]
}