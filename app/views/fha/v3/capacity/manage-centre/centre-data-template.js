[
  '{{repeat(1)}}',
  {
    name: "Fiveways House",
    phone: "0121 626 3704",
    email: "fiveways@fakemail.gov.uk",
    address: "1st Floor Short Spur <br /> Fiveways House <br /> Islington Row <br /> Birmingham <br /> B15 1SL",
    rooms: [
    '{{repeat(12)}}',
      {
        _id: '{{objectId()}}',
        index: '{{index()}}',
        name: function(){
            return "Room " + (this.index + 1);
        },
        groundFloor: '{{bool()}}',
        telephone: '{{bool()}}',
        lastUpdated: '{{date(new Date(2017, 0, 1), new Date(), "dd MMM YYYY")}}'
      }],
    openingTimes: [
      {day: "Monday",
       open: "09:00am - 17:00pm"},
      {day: "Tuesday",
       open: "09:00am - 17:00pm"},
      {day: "Wednesday",
       open: "09:00am - 17:00pm"},
      {day: "Thursday",
       open: "09:00am - 17:00pm"},
      {day: "Friday",
       open: "09:00am - 17:00pm"},
      {day: "Saturday",
       open: "Closed"},
      {day: "Sunday",
       open: "Closed"}
    ]
  }
]
    