'use strict';

var util = require('util');

exports.init = function(emitter, target, log, settings) {
  return new Console(emitter, target, log, settings);
};

function Console(emitter, target, log, settings) {
  var limit = settings.limit || -1;
  var limit_info = "";

  emitter.on('alert', function(level, lines, extra) {
    if (limit > 0 && lines.length > limit) {
        lines = lines.slice(lines.length - limit, lines.length);
        limit_info = util.format("(below is the last %d of them) ", limit);
    }
    console.log(util.format(
      '%s :: level(%d) :: %s %s:: %s',
      target.name,
      level,
      extra,
      limit_info,
      lines.join('\n')
    ));
  });
}
