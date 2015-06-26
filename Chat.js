Messages = new Meteor.Collection('messages');

if (Meteor.isClient) {
  //client
  Meteor.subscribe("userData");

  //////// Helpers for in-place editing/////////

  //Returns an event_map key for attatching "ok/cancel" events to a text input (given by selector)
  var okcancel_events = function (selector) {
    return 'keyup ' + selector + ', keydown ' + selector + ', focusout' + selector; 
  };

  //Creates an event handler for interpreting "escape", "return", and "blur" on a text field and calling "ok" or "cancel" callbacks
  var make_okcancel_handler = function (options) {
    var ok = options.ok || function () {};
    var cancel = options.cancel || function () {};

    return function (evt) {
      if (evt.type == "keydown" && evt.which == 27) {
        //escape = cancel
        cancel.call(this, evt);
      }
      else if (evt.type == "keyup" && evt.which == 13) {
        //blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };
  };

  Template.entry.events = {};

  Template.entry.events[okcancel_events('#messageBox')] = make_okcancel_handler({
    ok: function(text, event) {
      var ts = Date.now() / 1000;
      Messages.insert({ name: Meteor.user().profile.name, message: text, time: ts });
      event.target.value = "";
    }
  });

  Template.messages.messages = function () {
    return Messages.find({}, { sort: {time: -1} });
  };

  console.log(Meteor.user());

}

if (Meteor.isServer) {
  // server
Meteor.publish("userData", function () {
  if (this.userId) {
    return Meteor.users.find({_id: this.userId},
                             {fields: {'other': 1, 'things': 1}});
  } else {
    this.ready();
  }
});
}
