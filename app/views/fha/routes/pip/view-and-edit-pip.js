const fakeData = require('./fake-data')

function calculateTotals (plan, day) {
  plan[day].total_hcp.avaliable = 0
  plan[day].total_hcp.booked = 0
  plan[day].total_ucb.avaliable = 0
  plan[day].total_ucb.booked = 0
  plan[day].slots.forEach((el) => {
    plan[day].total_hcp.avaliable += Number(el.hcp.avaliable)
    plan[day].total_hcp.booked += Number(el.hcp.booked)
    plan[day].total_ucb.avaliable += Number(el.ucb.avaliable)
    plan[day].total_ucb.booked += Number(el.ucb.booked)
  })
  plan[day].total_avaliable = plan[day].total_hcp.avaliable + plan[day].total_ucb.avaliable
  plan[day].total_booked = plan[day].total_hcp.booked + plan[day].total_ucb.booked
  plan[day].total_opened = plan[day].total_avaliable + plan[day].total_booked
  return plan
}

function ViewPlan (req, res, next) {
  if (!req.session.viewAndEditPip) {
    console.log('No session key')


    req.session.viewAndEditPip = fakeData
  }

  req.session.viewAndEditPip = calculateTotals(req.session.viewAndEditPip, 'monday')
  req.session.viewAndEditPip = calculateTotals(req.session.viewAndEditPip, 'tuesday')

  res.locals.viewAndEditPip = req.session.viewAndEditPip
  next()
}

function EditMonday (req, res, next) {
  res.locals.viewAndEditPip = req.session.viewAndEditPip
  next()
}

function EditTuesday (req, res, next) {
  res.locals.viewAndEditPip = req.session.viewAndEditPip
  next()
}

function PostMonday (req, res, next) {
  if (req.session.viewAndEditPip) {
    req.session.viewAndEditPip.showPlan = true
    req.session.viewAndEditPip.monday.fte = Number(req.body.fte)
    req.body.slots.forEach((el, index) => {
      req.session.viewAndEditPip.monday.slots[index].hcp.avaliable = Number(el.hcpA)
      req.session.viewAndEditPip.monday.slots[index].ucb.avaliable = Number(el.ucbA)
    })
  }
  res.redirect('/fha/capacity-scenarios/view-and-edit-pip/view-plan')
}

function PostTuesday (req, res, next) {
  if (req.session.viewAndEditPip) {
    req.session.viewAndEditPip.showPlan = true
    req.session.viewAndEditPip.tuesday.fte = Number(req.body.fte)
    req.body.slots.forEach((el, index) => {
      req.session.viewAndEditPip.tuesday.slots[index].hcp.avaliable = Number(el.hcpA)
      req.session.viewAndEditPip.tuesday.slots[index].ucb.avaliable = Number(el.ucbA)
    })
  }
  res.redirect('/fha/capacity-scenarios/view-and-edit-pip/view-plan')
}


module.exports = {
  ViewPlan,
  EditMonday,
  PostMonday,
  EditTuesday,
  PostTuesday
}
