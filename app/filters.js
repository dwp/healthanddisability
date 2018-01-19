var moment = require('moment')
var loremIpsum = require('lorem-ipsum')
var _ = require('lodash')

module.exports = function (env) {
  /**
   * Instantiate object used to store the methods registered as a
   * 'filter' (of the same name) within nunjucks. You can override
   * gov.uk core filters by creating filter methods of the same name.
   * @type {Object}
   */
  var filters = {}

  filters.pickDescriptor = function(nuggets, descriptor)
  {
    return _.filter(nuggets, function(o)
    {
      return _.includes(o.descriptors,descriptor);
    })
  }

  /*
    ascdes is to say whether it's
  */
  filters.sortBy = function(collection,type,des) {
      var newArray = _.sortBy(collection,type);
      if (!des) return newArray
      else return _.reverse(newArray)
  }

  filters.formatDate = function(str,format) {
      var d = moment(str).format(format);
      if (d !== 'Invalid date') return d;
      else return '';
  }

  filters.monthsAgo = function(format,num) {
      var d = moment().subtract(num,"months").format(format)
      if (d !== 'Invalid date') return d
      else return ''
  }

  filters.daysAgo = function(format,num) {
      var d = moment().subtract(num,"days").format(format)
      if (d !== 'Invalid date') return d
      else return ''
  }

  filters.randMonthsAgo = function(format,num) {
      var num = Math.ceil(Math.random()*num);
      var d = moment().subtract(num,"months").format(format)
      if (d !== 'Invalid date') return d
      else return ''
  }

  filters.randDaysAgo = function(format,num) {
      var num = Math.ceil(Math.random()*num);
      var d = moment().subtract(num,"days").format(format)
      if (d !== 'Invalid date') return d
      else return ''
  }

  filters.lorum = function(pars) {
      var str = loremIpsum({
        count: pars,
        units: "paragraphs",
        format: 'plain',
        suffix: "<br />"
      })
      return lowerFirstLetter(str);
  }

  filters.lorumsent = function(pars) {
      var str = loremIpsum({
        count: pars,
        units: "sentences",
        format: 'plain',
        suffix: "<br />"
      })
      return lowerFirstLetter(str);
  }

  filters.lorumwords = function(pars) {
      var str = loremIpsum({
        count: pars,
        units: "words",
        format: 'plain',
        suffix: "<br />"
      })
      return lowerFirstLetter(str);
  }

  filters.randArray = function(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  }

  filters.randNumber = function(num) {
    return Math.ceil(Math.random()*num);
  }

  filters.slug = function(str) {
    return slugify(str);
  }

  function slugify(text)
  {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '')            // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '')          // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }


  /* ------------------------------------------------------------------
    add your methods to the filters obj below this comment block:
    @example:

    filters.sayHi = function(name) {
        return 'Hi ' + name + '!'
    }

    Which in your templates would be used as:

    {{ 'Paul' | sayHi }} => 'Hi Paul'

    Notice the first argument of your filters method is whatever
    gets 'piped' via '|' to the filter.

    Filters can take additional arguments, for example:

    filters.sayHi = function(name,tone) {
      return (tone == 'formal' ? 'Greetings' : 'Hi') + ' ' + name + '!'
    }

    Which would be used like this:

    {{ 'Joel' | sayHi('formal') }} => 'Greetings Joel!'
    {{ 'Gemma' | sayHi }} => 'Hi Gemma!'

    For more on filters and how to write them see the Nunjucks
    documentation.

  ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------
    keep the following line to return your filters to the app
  ------------------------------------------------------------------ */
  return filters
}

function lowerFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}
