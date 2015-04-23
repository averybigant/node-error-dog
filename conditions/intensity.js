'use strict';

var util = require('util');

exports.init = function(emitter, target, log, settings) {
  return new Intensity(emitter, target, log, settings);
};

// settings
//
//   @key {Number} interval  // optional, default: 60 (s)
//   @key {Array} thresholds // optional, default: [1, 15, 45]
//
//
function Intensity(emitter, target, log, settings) {
  // settings
  var interval   = settings.interval || 60;
  var thresholds = settings.thresholds || [1, 15, 45];

  var lines = [];

  emitter.on('line', function(line) {
    lines.push(line);
  });

  setInterval(function() {
    for (var level = thresholds.length - 1; level >= 0; level--) {
      if (lines.length >= thresholds[level] && lines.length > 0) {
        emitter.emit('alert', level, lines, util.format(
          '%d error messages in %d seconds', lines.length, interval));
      }
    }
    lines = [];
  }, interval * 1000);
}
