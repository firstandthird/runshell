'use strict';
const exec = require('child_process').exec;
const obj2args = require('obj2args');

// see
// https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
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
  // properties in options.env will over-ride the default process.env:
  if (options.env) {
    options.env = Object.assign(process.env, options.env);
  } else {
    options.env = process.env;
  }
  options.cwd = options.cwd || process.cwd();
  commandName = `${commandName} ${args.join(' ')}`;
  const output = exec(commandName, options, callback);
  if (options.stream) {
    output.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    output.stderr.on('data', (data) => {
      console.log(data.toString());
    });
  }
};
