/**
 * Alerter console
 */

var util = require('util');


/**
 * @exports
 * @param {EventEmitter} emitter
 * @param {Object} target
 * @param {Function} log
 * @param {Object} settings
 * @return {Console}
 */
exports.init = function(emitter, target, log, settings) {
  return new Console(emitter, target, log, settings);
};


/**
 * @constructor
 * @param {EventEmitter} emitter
 * @param {Object} target
 * @param {Function} log
 * @param {Object} settings
 * @return {Console}
 */
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
