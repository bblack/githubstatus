$(function(){
  App.init()
});

function updateHeader(status){
  $(document.body).
    removeClass('good').
    removeClass('minorproblem').
    removeClass('majorproblem').
    addClass(status)
}

var App = {
  heading: {
    'good': "Battle station fully operational",
    'minorproblem': "Partial service outage",
    'majorproblem': "Major service outage"
  },

  lolHeadings: {
    good: ["Battle station fully operational"],
    minorproblem: ["brb bathroom", "We had a couple beers with lunch", "I don't understand, this should be working", "Works fine on my machine"],
    majorproblem: ['We all went home and drank', "Slava doesn't work today", 'Ops is at a Halo tourney', "Wasn't today was a holiday?"]
  },

  lolHeading: function(status) {
    headings = this.lolHeadings[status]
    return headings[Math.floor(Math.random()*headings.length)]
  },

  secondsToUpdate: 31,

  init: function(){
    this.headingElement = $('#statusbar h1')
    this.contentElement = $('.main')
    this.secondsElement = $('#time-to-update')
    this.updatedElement = $('.last-updated')

    $('#tweets').tweet()
    this.realtimeRequest()
  },

  request: function(){
    var handleResponse = function(json){
      App.setDayStatuses(json['days'])
      App.updatedElement.text(json['last_updated'])
      if (json['status'] != 'good')
        App.setStatus(json['status'])
      App.tick()
    }

    $.getJSON('/status.json?cache=' + Math.random(), handleResponse)
  },

  realtimeRequest: function(){
    $('.spinner').show();
    $.getJSON('/realtime.json?cache=' + Math.random() + '&' + location.search.substring(1), App.setRealtime)
  },

  setStatus: function(status){
    updateHeader(status)
    this.headingElement.text(this.lolHeading(status))
  },

  setRealtime: function(json){
    var any_down = false
    $.each(json, function(key, value){
      placeholder = $('#' + key + ' .status')
      check = (value ? 'up' : 'down')
      title = placeholder.parent().text().trim()
      msg   = (value ? 'Fully operational.' : 'Service outage.')

      placeholder.
        removeClass('down').
        removeClass('up').
        addClass(check).
        parent().
        attr('title', title + ': ' + msg)

      if (check == 'down')
        any_down = true
    })

    if (any_down){
      updateHeader('minorproblem')
      App.headingElement.text(App.lolHeading('minorproblem'))
    } else {
      updateHeader('good')
      App.headingElement.text(App.lolHeading('good'))
    }

    $('.spinner').hide();

    App.request()
  },

  setDayStatuses: function(data){
    var el = this.contentElement.empty()
    $.each(data, function(index, day){
      var text = day['date']

      if (day['status'] == 'minorproblem') text = text + ' &ndash; minor interruption occurred'
      if (day['status'] == 'majorproblem') text = text + ' &ndash; major interruption occurred'

      el.append('<h3 class="' + day['status'] + '">' + text + '</h3>')
      el.append(day['message'])
    })
  },

  tick: function(){
    if (this.secondsToUpdate <= 0){
      this.secondsToUpdate = 31
      this.realtimeRequest()
    }else{
      this.secondsToUpdate--;
      this.secondsElement.text(this.secondsToUpdate)
      setTimeout(function(){ App.tick() }, 1000)
    }
  }
}
