/* global $ */
/* global GOVUK */

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  // Use GOV.UK shim-links-with-button-role.js to trigger a link styled to look like a button,
  // with role="button" when the space key is pressed.
  GOVUK.shimLinksWithButtonRole.init()

  // Show and hide toggled content
  // Where .multiple-choice uses the data-target attribute
  // to toggle hidden content
  var showHideContent = new GOVUK.ShowHideContent()
  showHideContent.init()
})

$(document).on('ready', function () {
  $('.click_row').on('click', function (e) {
    e.preventDefault()
    var href = $(this).attr('href')
    window.location.href = href
  })
})

$("input[type='checkbox'][class='mon-fil']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#monday-filter').show()
  } else {
    $('#monday-filter').hide()
  }
})

$("input[type='checkbox'][class='tue-fil']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#tuesday-filter').show()
  } else {
    $('#tuesday-filter').hide()
  }
})

$("input[type='checkbox'][class='wed-fil']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#wednesday-filter').show()
  } else {
    $('#wednesday-filter').hide()
  }
})

$("input[type='checkbox'][class='thu-fil']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#thursday-filter').show()
  } else {
    $('#thursday-filter').hide()
  }
})

$("input[type='checkbox'][class='fri-fil']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#friday-filter').show()
  } else {
    $('#friday-filter').hide()
  }
})

$("input[type='checkbox'][class='sat-fil']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#saturday-filter').show()
  } else {
    $('#saturday-filter').hide()
  }
})

$("input[type='checkbox'][class='time-slot1']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#time1-filter').show()
  } else {
    $('#time1-filter').hide()
  }
})

$("input[type='checkbox'][class='time-slot2']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#time2-filter').show()
  } else {
    $('#time2-filter').hide()
  }
})

$("input[type='checkbox'][class='time-slot3']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#time3-filter').show()
  } else {
    $('#time3-filter').hide()
  }
})

$("input[type='checkbox'][class='access-floor']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#special-access').show()
  } else {
    $('#special-access').hide()
  }
})
$("input[type='checkbox'][class='interpreter']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#special-interpreter').show()
  } else {
    $('#special-interpreter').hide()
  }
})

$("input[type='checkbox'][class='same-gender']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#special-gender').show()
  } else {
    $('#special-gender').hide()
  }
})

$("input[type='checkbox'][class='security-req']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#special-security').show()
  } else {
    $('#special-security').hide()
  }
})

$("input[type='checkbox'][class='doctor-req']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#special-doctor').show()
  } else {
    $('#special-doctor').hide()
  }
})

$("input[type='checkbox']").on('change', function () {
  if ($(this).is(':checked')) {
    $('#no-filter').remove()
  }
})

// Own functionality

$(document).ready(function () {
  $('tr').each(function () {
    var $name = $(this).find('.col-heading').text()
    $(this).before("<tr class='done' style='display:none'><td colspan='6'>" + $name + " added to &lsquo;my referrals&rsquo;&nbsp;&nbsp;<a href='#' class='undo'>Undo</a></td></tr>")
  })

  var $ownButtons = $('.add a')
  var $undoButtons = $('.undo')

  $ownButtons.click(function () {
    var $row = $(this).parent().parent()
    var $rowBefore = $row.prev()
    var $name = $(this).parent().parent().find('.col-heading').text()

    $rowBefore.css('display', 'table-row')
    $row.css('display', 'none')

    // Updates totals

    $availableTotal = parseInt($('#available-refs-total').text()) - 1
    $('#available-refs-total').html($availableTotal)

    $teamTotal = parseInt($('#team-refs-total').text()) + 1
    $('#team-refs-total').html($teamTotal)

    $myTotal = parseInt($('#my-refs-total').text()) + 1
    $('#my-refs-total').html($myTotal)

    return false
  })

  $undoButtons.click(function () {
    var $row = $(this).parent().parent()
    var $rowAfter = $row.next()
    var $name = $(this).parent().parent().find('.col-heading').text()

    $rowAfter.css('display', 'table-row')
    $row.css('display', 'none')

    // Updates totals

    $availableTotal = parseInt($('#available-refs-total').text()) + 1
    $('#available-refs-total').html($availableTotal)

    $teamTotal = parseInt($('#team-refs-total').text()) - 1
    $('#team-refs-total').html($teamTotal)

    $myTotal = parseInt($('#my-refs-total').text()) - 1
    $('#my-refs-total').html($myTotal)

    return false
  })
})

$(document).ready(function () {
  $('[data-toggle-content]').click(function (event) {
    var element = $(this).data('toggleContent')
    $('#' + element).toggleClass('hidden')
  })

  if ($('[name=HcpType]').value) {
    if ($('[name=HcpType]').value !== 'doctor') {
      $('#HcpSkillLevel').show()
    } else {
      $('#HcpSkillLevel').hide()
    }
  } else {
    $('#HcpSkillLevel').hide()
  }

  $('[name=HcpType]').change(function () {
    var value = this.value
    if (value === 'doctor') {
      $('#HcpSkillLevel').hide()
    } else {
      $('#HcpSkillLevel').show()
    }
  })
})

$(document).ready(function () {
  $('[data-click-add-more]').click(function (event) {
    var input = document.getElementById('centre-new-detail-input')
    var template = '<li>' +
          input.value +
          ' (<a href="#" data-click-to-remove>remove</a>)' +
          '</li>'

    var list = document.getElementById('details-list')
    var x
    $(list).append(template)

    var hiddenInput = document.createElement('input')
    hiddenInput.type = 'hidden'
    hiddenInput.value = input.value
    hiddenInput.name = 'details[]'
    document.getElementById('details-form').append(hiddenInput)
    input.value = ''
  })

  $(document).on('click', '[data-click-to-remove]', function (event) {
    $(this).parent('li').remove()
  })

  $('#appointment-times-edit').hide()
  $('#appointment-times-view-edited').hide()

  $(document).on('click', '[data-click-edit-slots]', function (event) {
    $('#appointment-times-edit').show()
    $('#appointment-times-view').hide()
    $('#appointment-times-view-edited').hide()
  })

  $(document).on('click', '[data-click-save-slots]', function (event) {
    $('#appointment-times-edit').hide()
    $('#appointment-times-view-edited').show()
  })

  $(document).on('click', '[data-add-appointment-time]', function (event) {
    var list = document.getElementById('edit-times-list'),
      input = document.getElementById('new-time-input')

    var template = `<li id="slot-time-">
                        <div>${input.value}</div>
                        <a href="#" data-click-to-remove>remove</a>
                    </li>`
    $(list).append(template)

    input.value = ''
  })
})

// calendar date picker /assess/v7/capacity/manage-staff/staff-availability

$(document).ready(function () {
  var selectedDates = []

  var generateDateList = function (dates) {
    var output = ''
    dates.map(date => output = output + '<li>' + moment(date).format('ddd D MMMM YYYY') + '</li>')
    return output
  }

  var generateInputs = function (dates) {
    var div = document.getElementById('generatedDateInputs')
    div.innerHTML = ''

    dates.map(function (date) {
      var input = document.createElement('input')
      input.value = date
      input.type = 'hidden'
      input.name = 'dates[]'
      div.append(input)
    })
  }

  $('.calendar-picker__day--selectable').click(function () {
    var thisDate = $(this).data('date')

    if (selectedDates.indexOf(thisDate) === -1) {
      selectedDates.push(thisDate)
    } else {
      selectedDates = selectedDates.filter(date => date !== thisDate)
    }
    selectedDates.sort(function (a, b) {
      return moment(a) - moment(b)
    })

    $(this).toggleClass('calendar-picker__day--selected')

    $('#availability-form').removeClass('hidden')
    document.getElementById('dateList').innerHTML = generateDateList(selectedDates)
    generateInputs(selectedDates)
  })
})

$(document).ready(function () {
  $('#caller-other-content').hide()
  $(document).on('change', "[name='caller']", function (event) {
    if (this.value == 'other') {
      $('#caller-other-content').show()
    } else {
      $('#caller-other-content').hide()
    }
  })
})

$(document).ready(function () {
  $('#selectAll').show()
  $('#selectAll').on('click', function (event) {
    var btn = $(event.target)
    var chkd = btn.text() === 'Select all'
    btn.text(chkd ? 'De-Select all' : 'Select all')
    $('.timeslot-picker [type="checkbox"]').prop('checked', chkd)
  })
})

$(document).ready(function () {
  $('#facetFilterBtn').hide()
  $('.facet').on('change', e => {
    $('#facetFilterBtn').click();
  })
})
