//Use this to generate data from https://www.json-generator.com/

[
  '{{repeat(12)}}',
  {
    id: '{{objectId()}}',
    index: '{{index()}}',
    guid: '{{guid()}}',
    surname: '{{surname()}}',
    firstname: '{{firstName()}}',
    phone: '01{{phone("xx xxxxxx")}}',
    mobile: '07{{phone("xxx xxxxxx")}}',
    name: function(){
         return this.firstname + " " + this.surname;
    },
    email: function(){
      var email = this.firstname + "." + this.surname+ "@fakemail.gov.uk";
      return email.toLowerCase();
    },
    gender: '{{gender()}}',
    type: function (tags) {
      var types = ['Doctor', 'Other'];
      return types[tags.integer(0, types.length - 1)];
    },
    skill: function(tags){
      var skills = ["Neuro", "Standard"];
      if(this.type === "Doctor"){
        return "Complex Neuro";
      } else {
    return skills[tags.integer(0, skills.length - 1)];
      }
    },
    scrutinyPaperwork: function(){
      if(this.type == "Doctor") {
    return Math.random() < 0.5;
      } else {
    return false;
      }
    },
    days: {
      monday: {
        available: function(){
          return Math.random() > 0.2;
        },
        start: "09:00",
        end: "17:00",
        scrutiny: function(){
          return Math.random() < 0.2;
        }
      },
      tuesday: {
        available: true,
        start: "09:00",
        end: "17:00",
        scrutiny: function(){
          return Math.random() < 0.2;
        }
      },
      wednesday: {
        available: true,
        start: "09:00",
        end: "17:00",
        scrutiny: function(){
          return Math.random() < 0.2;
        }
      },
      thursday: {
        available: true,
        start: "09:00",
        end: "17:00",
        scrutiny: function(){
          return Math.random() < 0.2;
        }
      },
      friday: {
        available: true,
        start: "09:00",
        end: "17:00",
        scrutiny: function(){
          return Math.random() < 0.2;
        }
      } 
    } 
  }
]