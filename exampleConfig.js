// Example configuration for errdog

// conditions
var intensity = require('./conditions/intensity');

// alerters
var console_ = require('./alerters/console');
var hipchat = require('./alerters/hipchat');

// target `foo`
var foo = {
  name: 'foo',
  path: '/path/to/foo.error.log',
  extract: function(line) {
    return line;
  },
  ignore: function(line) {
    return line.indexOf('to-be-ignored') < 0;
  },
  alerters: [
    [console_, {limit: -1}],
    [hipchat, {token: 'xxx', room: 123, atwho: ['@here'], limit: -1}]
  ],
  conditions: [
    [intensity]
  ]
};

// exports
exports = module.exports = [foo];
