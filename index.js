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
  let outputString = '';
  let errorString = '';
  if (options.exec) {
    args.unshift(commandName);
    commandName = options.exec;
  }
  commandName = `${commandName} ${args.join(' ')}`;
  console.log('command is:')
  console.log(commandName)
  // const shellCommand = spawn(commandName, args, options)
  const shellCommand = exec(commandName, options, callback)
  // .on('error', (data) => {
  //   errorString += data.toString();
  // })
  // .on('exit', (exitCode) => {
  //   const error = exitCode === 0 ? null : {
  //     exitCode,
  //     message: errorString
  //   };
  //   return callback(error, outputString);
  // });
  // shellCommand.stdout.on('data', (data) => {
  //   outputString += data.toString();
  // });
};
