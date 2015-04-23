'use strict';

var util = require('util');

exports.init = function(emitter, target, log, settings) {
  return new Console(emitter, target, log, settings);
};

function Console(emitter, target, log, settings) {
  emitter.on('alert', function(level, lines, extra) {
    console.log(util.format(
      '%s :: level(%d) :: %s :: %s',
      target.name,
      level,
      extra,
      lines.join('\n')
    ));
  });
}
