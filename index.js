const enrollmentReport = new FileReader()

document.getElementById('EnrollmentReport').addEventListener("input", function (e) {
  enrollmentReport.readAsText(e.target.files[0])
})
document.getElementById('ClickOverlay').addEventListener('click', function () {
  document.getElementById('NameSuggestions').innerHTML = ''
  document.getElementById('LocationSuggestions').innerHTML = ''
  document.getElementById('ClickOverlay').style = 'display:none'
})

enrollmentReport.addEventListener('load', function (e) {
  var report = e.target.result.split('\n').map(a => a.split('","').map((b, i) => {
    if (!i && b[0] == "\"") {
      return b.substring(1)
    } else if (i == a.split('","').length - 1 && b[b.length - 1] == "\"") {
      return b.substring(0, b.length - 1)
    } else {
      return b
    }
  }))
  report = report.filter(a => a.length == report[0].length)
  document.getElementById('SelectionForm').classList = []

  var sectionIds = []
  var courseNames = []
  var courseStartDates = []
  var courseLocations = []

  var indexes = [
    report[0].indexOf('Student Connection: Section ID'),
    report[0].indexOf('Course Offering ID'),
    report[0].indexOf('Course Start Date'),
    report[0].indexOf('Student Connection: Facility')
  ]
  console.log(report)
  for (var i in report) {
    if (i) {
      if (report[i][indexes[0]] && !sectionIds.includes(report[i][indexes[0]])) {
        sectionIds.push(report[i][indexes[0]])
      }
      if (report[i][indexes[1]] && !courseNames.includes(report[i][indexes[1]].toLowerCase())) {
        courseNames.push(report[i][indexes[1]].toLowerCase())
      }
      if (report[i][indexes[2]] && !courseStartDates.includes(report[i][indexes[2]].toLowerCase())) {
        courseStartDates.push(report[i][indexes[2]].toLowerCase())
      }
      if (report[i][indexes[3]] && !courseLocations.includes(report[i][indexes[3]].toLowerCase())) {
        courseLocations.push(report[i][indexes[3]].toLowerCase())
      }
    }
  }
  console.log(!indexes.includes(-1), report.length, sectionIds.length, courseNames.length, courseStartDates.length, courseLocations.length)
  var inputTimeOut

  document.getElementById('CourseName').addEventListener('input', function (e) {
    if (inputTimeOut) {
      clearTimeout(inputTimeOut)
    }
    inputTimeOut = setTimeout(function () {
      var suggestionBox = document.getElementById('NameSuggestions')
      suggestionBox.innerHTML = ''
      if (e.target.value) {
        document.getElementById('ClickOverlay').style = 'display:block'
        for (var suggestion of courseNames.filter(a => a.includes(e.target.value))) {
          var newsuggestion = document.createElement('div')
          newsuggestion.append(suggestion)
          newsuggestion.addEventListener('click', function (e) {
            document.getElementById('CourseName').value = e.target.innerText
            suggestionBox.innerHTML = ''
            document.getElementById('ClickOverlay').style = 'display:none'
          })
          suggestionBox.append(newsuggestion)
        }
      }
    }, 250)
  })
  document.getElementById('SelectionForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var inputID = e.target.elements.SectionId.value
    var inputName = e.target.elements.CourseName.value
    var inputDate = e.target.elements.CourseStartDate.value ? moment(e.target.elements.CourseStartDate.value).format('M/D/YYYY') : false
    var inputLocation = e.target.elements.CourseLocation.value
    var foundID
    var i
    for (i = 0; i < report.length; i++) {
      if (
        (inputID && inputID == report[i][indexes[0]]) ||
        (
          (inputName && inputName.toLowerCase() == report[i][indexes[1]].toLowerCase()) &&
          (inputDate && inputDate == report[i][indexes[2]]) &&
          (inputLocation && inputLocation.toLowerCase() == report[i][indexes[3]].toLowerCase())
        )
      ) {
        foundID = report[i][0]
        break;
      }
    }
    console.log(i + 1)
    var students = report.filter(record => record[0] == foundID).map(record => ({
      firstName: record[report[0].indexOf('Contact')].split(' ').slice(0, -1).join(' '),
      lastName: record[report[0].indexOf('Contact')].split(' ').slice(-1).join(' '),
      email: record[report[0].indexOf('Email')],
      phone: record[report[0].indexOf('Phone Number')]
    }))
    console.log(i)
    var roll = {
      sectionId: report[i + 1][indexes[0]],
      courseName: report[i + 1][indexes[1]],
      startDate: report[i + 1][indexes[2]],
      location: report[i + 1][indexes[3]],
      weekdays: report[i + 1][report[0].indexOf('Student Connection: Class days')].split(',').filter(Boolean).map(a => a.trim()),
      time: report[i + 1][report[0].indexOf('Student Connection: Time Block')],
      students: students.sort(mySort),
      department: report[i + 1][report[0].indexOf('Department')],
      // sessions: report[i][report[0].indexOf('Student Connection: Total Sessions')],
      // sessionsPerWeek: report[i][report[0].indexOf('Student Connection: Sessions per Week')],
      enrollment: students.length,
      totalWeeks: parseInt(report[i + 1][report[0].indexOf('Student Connection: Total Weeks')]),
      instructor: report[i + 1][report[0].indexOf('Student Connection: Primary Faculty')],
      endDate: report[i + 1][report[0].indexOf('Course End Date')],
      isYouth: document.getElementById("Youth").checked
    }
    console.log(roll)
    generateRoll(roll)
    function mySort(a, b) {
      var firstA = a.firstName.toLowerCase()
      var firstB = b.firstName.toLowerCase()
      var lastA = a.lastName.toLowerCase()
      var lastB = b.lastName.toLowerCase()
      return lastA < lastB ? -1 : lastA > lastB ? 1 : firstA < firstB ? -1 : firstA > firstB ? 1 : 0

    }
  })
  document.getElementById('CourseLocation').addEventListener('input', function (e) {
    if (inputTimeOut) {
      clearTimeout(inputTimeOut)
    }
    inputTimeOut = setTimeout(function () {
      var suggestionBox = document.getElementById('LocationSuggestions')
      suggestionBox.innerHTML = ''
      if (e.target.value) {
        document.getElementById('ClickOverlay').style = 'display:block'
        for (var suggestion of courseLocations.filter(a => a.includes(e.target.value))) {
          var newsuggestion = document.createElement('div')
          newsuggestion.append(suggestion)
          newsuggestion.addEventListener('click', function (e) {
            document.getElementById('CourseLocation').value = e.target.innerText
            suggestionBox.innerHTML = ''
            document.getElementById('ClickOverlay').style = 'display:none'
          })
          suggestionBox.append(newsuggestion)
        }
      }
    }, 250)
  })
})
// generateRoll({
//     sectionId: 'blah',
//     courseName: 'Boo!',
//     startDate: '1/1/1111',
//     location: 'Moon',
//     weekdays: ['Su', 'Mo'],
//     time: 'pizza-pineapple',
//     students: [
//         {
//             firstName:'Carol Watsen MA',
//             lastName:'BS',
//             phone:'',
//             email:'NO'
//         },
//         {
//             firstName: 'Harry James',
//             lastName: 'Potter',
//             email: 'Hedwig',
//             phone: 'wand 8.5'
//         }
//     ],
//     department: 'Kookie fanclub',
//     // sessions: report[i][report[0].indexOf('Student Connection: Total Sessions')],
//     // sessionsPerWeek: report[i][report[0].indexOf('Student Connection: Sessions per Week')],
//     enrollment: 1,
//     totalWeeks: 3,
//     instructor: 'Darth Vader',
//     endDate: '2/2/2222',
//     isYouth: true
// })
function generateRoll(courseInfo) {
  document.getElementById('Roll').style.display = 'block'
  document.getElementById("rolldept").innerHTML = courseInfo.department
  document.getElementById("rollsecname").innerHTML = courseInfo.sectionId + " " + courseInfo.courseName
  document.getElementById("rolldates").innerHTML = courseInfo.startDate + "-" + courseInfo.endDate
  document.getElementById("rolldayinstruct").innerHTML = courseInfo.weekdays + " Instructor: " + courseInfo.instructor
  document.getElementById("rolllocatetimes").innerHTML = courseInfo.location + " " + courseInfo.time
  document.getElementById("rolltotal").innerHTML = 'Total Enrollment: ' + courseInfo.enrollment
  var dates = []
  var startDate = moment(courseInfo.startDate, 'MM/DD/YYYY')
  while (dates.length < courseInfo.weekdays.length * (courseInfo.totalWeeks || 1)) {
    courseInfo.weekdays.map(a => {
      var day = weekdayTranslation(a)
      if (day == startDate.format('dddd').toLowerCase()) {
        dates.push(startDate.format('M/D'))
      }
    })
    startDate.add(1, 'day')
  }
  console.log(dates)
  document.getElementById("rollattenddates").append(...dates.map(a => {
    var div = document.createElement('div')
    div.innerHTML = a
    return div
  }))
  document.getElementById("rollList").append(...courseInfo.students.map(a => {
    var row = document.createElement('div')
    row.style.display = 'flex'
    row.style.justifyContent = 'space-between';
    var student = document.createElement('div')
    var namediv = document.createElement('div')
    var emaildiv = document.createElement('div')
    var phonediv = document.createElement('div')
    namediv.innerHTML = a.lastName + ", " + a.firstName
    emaildiv.innerHTML = a.email
    phonediv.innerHTML = a.phone
    student.append(namediv, emaildiv, phonediv)
    var boxes = document.createElement('div')
    boxes.style.display = 'flex'
    boxes.append(...dates.map(a => document.createElement('div')))
    boxes.className = 'rollboxes'
    row.append(student, boxes)
    return [row, document.createElement('hr')]
  }).flat())



}
function weekdayTranslation(day) {
  const weekdays = {
    sunday: ['su', 'sun', 'sunday'],
    monday: ['m', 'mo', 'mon', 'monday'],
    tuesday: ['tu', 'tue', 'tuesday'],
    wednesday: ['w', 'we', 'wed', 'wednesday'],
    thursday: ['th', 'thu', 'thur', 'thurs', 'thursday'],
    friday: ['f', 'fr', 'fri', 'friday'],
    saturday: ['s', 'sa', 'sat', 'saturday'],
  }
  return Object.keys(weekdays).find(weekday => weekdays[weekday].includes(day.toLowerCase()))
}
function closeRoll() {
  document.getElementById("rollattenddates").innerHTML = ""
  document.getElementById("rollList").innerHTML = ""
  document.getElementById('Roll').style.display = 'none'
}