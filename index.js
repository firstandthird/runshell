'use strict';
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const obj2args = require('obj2args');

// see
// https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
// for additional options

module.exports = (commandName, options, callback) => {
  // second argument is optional:
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  let args = options.args ? obj2args(options.args) : [];
  // make sure args is an array:
  if (typeof args === 'string') {
    args = [args];
  }
  options.env = options.env || {};
  options.cwd = options.cwd || process.cwd();
  commandName = `${commandName} ${args.join(' ')}`;
  exec(commandName, options, callback);
};
