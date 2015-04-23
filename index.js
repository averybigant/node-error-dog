// Node Error Dog, Notify you on error logs!
// https://github.com/eleme/node-error-dog.git
//
// Only avaliable on Unix (with GNU tail), the Linux or OSX(with gnu tail).
//
// The MIT License (MIT) Copyright (c) 2014 - 2015 Eleme, Inc.

'use strict';

var events        = require('events');
var util          = require('util');
var child_process = require('child_process');

// Log one message to process stdout.
//
// @param {String} format
// @param {String} args
//
function log() {
  var msg = util.format.apply(null, arguments);
  var now = new Date();
  var pid = process.pid;
  process.stdout.write(util.format('%s[%d]: %s\n', now, pid, msg));
}

// Watch a target
//
function watch(target) {
  target.extract = target.extract || function(line) {
    return line;
  };

  var emitter = new events.EventEmitter();

  // `tail -F` will keep track changes to the file by filename, instead
  // of using the inode number.This can handle the situation like
  // `logrotation`, and it also keeps trying to open a new file if it's
  // not present.
  var child = child_process.spawn('tail', ['-n', 0, '-F', target.path]);

  child.stdout.on('data', function(data) {
    var lines = data.toString().trim()
                .split('\n');

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (target.ignore && target.ignore(line)) {
        continue;
      }

      if (target.grep && !target.grep(line)) {
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

  child.on('exit', function(code, signal) {
    throw new Error('Child process exit with code ' + code);
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

// Watch all targets
(function() {
  var targets = require(process.argv[2]);
  targets.forEach(function(target) {
    watch(target);
  });
})();
