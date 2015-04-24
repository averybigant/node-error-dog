'use strict';

var request = require('request');
var util    = require('util');

exports.init = function(emitter, target, log, settings) {
  return new Hipchat(emitter, target, log, settings);
};

// settings
//
//   @key {String} token  // required
//   @key {Number} room  // required
//   @key {String} from  // optional, default: target.name
//   @key {Boolean} notify  // optional, default: true
//   @key {String} messageFormat  // optional, default: 'text'
//   @key {Array} atwho  // optional, default: [], e.g. ['@hit9']
//
function Hipchat(emitter, target, log, settings) {
  // settings
  var token         = settings.token;
  var room          = settings.room;
  var from          = settings.from || target.name;
  var notify        = settings.notify || true;
  var messageFormat = settings.messageFormat || 'text';
  var atwho         = settings.atwho || [];
  // api url
  var url = util.format('http://api.hipchat.com/v1/rooms/message' +
                        '?format=json&auth_token=%s', token);

  var alert = function(message, color, code) {
    var form = {
      'room_id': room,
      from: from,
      notify: +notify,
      'message_format': messageFormat,
      message: code ? util.format('/code %s', message) : message,
      color: color || 'gray'
    };
    return request.post({url: url, form: form}, function(err, resp, body) {
      if (err) {
        log('Hipchat Alerter Error: %s', err.stack);
      }
    });
  };

  var colors = ['gray', 'yellow', 'red'];

  emitter.on('alert', function(level, lines, extra) {
    var color = colors[level];

    if (level === 2 && atwho.length > 0) {
      alert(util.format('%s %s', atwho.join(' '), extra), color, false);
    }
    if (lines.length > 0) {
      return alert(lines.join('\n').slice(0, 9900), color, true);
    }
  });
}
