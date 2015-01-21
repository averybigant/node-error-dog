/**
 * Node Error Dog, Notify you on error logs!
 * https://github.com/eleme/node-error-dog.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2014 hit9
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */

var events = require('events');
var util = require('util');
var child_process = require('child_process');


/**
 * Log one message to process stdout.
 *
 * @param {String} format
 * @param {String} args
 */
function log() {
  var msg = util.format.apply(null, arguments);
  var now = new Date();
  var pid = process.pid;
  process.stdout.write(util.format('%s[%d]: %s\n', now, pid, msg));
}


/**
 * Watch a target
 *
 * @param {Object} target
 */
function watch(target) {
  target.extract = target.extract || function(line) {
    return line;
  };

  var emitter = new events.EventEmitter();

  var child = child_process.spawn('tail', ['-n', 0, '-f', target.path]);

  child.stdout.on('data', function(data) {
    var lines = data.toString().trim()
                .split('\n');

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (target.ignore && target.ignore(line)) {
        continue;
      }

      line = target.extract(line);
      emitter.emit('line', line);
    }
  });

  child.on('error', function(error) {
    if (error) {
      throw error;
    }
  });

  target.alerters.forEach(function(list){
    var alerter = list[0];
    var settings = list[1] || {};
    alerter.init(emitter, target, log, settings);
  });

  target.conditions.forEach(function(list){
    var condition = list[0];
    var settings = list[1] || {};
    condition.init(emitter, target, log, settings);
  });
}


/**
 * Watch all targets.
 */
(function() {
  var targets = require(process.argv[2]);
  targets.forEach(function(target) {
    watch(target);
  });
})();
