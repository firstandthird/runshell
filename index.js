'use strict';
const { spawn } = require('child_process');
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
  delete options.args;
  // properties in options.env will over-ride the default process.env:
  if (options.env) {
    options.env = Object.assign(process.env, options.env);
  } else {
    options.env = process.env;
  }
  options.cwd = options.cwd || process.cwd();
  commandName = `${commandName} ${args.join(' ')}`;
  if (options.verbose) {
    console.log(`Running ${commandName}`); //eslint-disable-line no-console
  }

  options.shell = true;
  options.setsid = true;
  // if a custom logger was specified, assume options.log is true:
  options.log = options.log || options.logger;
  // default logger is console.log or you can pass a custom one:
  options.logger = options.logger || console.log;

  const cmd = spawn(commandName, options);
  const outputdata = [];
  const outputerr = [];
  cmd.stdout.on('data', (data) => {
    outputdata.push(data);
    if (options.log) {
      options.logger(data.toString()); // eslint-disable-line no-console
    }
  });
  cmd.stderr.on('data', (data) => {
    outputerr.push(data);
    if (options.log) {
      options.logger(data.toString());
    }
  });

  cmd.on('error', (err) => {
    options.logger('ERROR: ', err);
  });

  cmd.on('exit', (code, signal) => {
    if (code !== 0) {
      return callback({ code, signal, err: outputerr.join(''), msg: 'An error occured' });
    }

    callback(null, outputdata.join(''));
  });

  if (options.timeout) {
    setTimeout(() => {
      cmd.kill();
    }, options.timeout);
  }
  return cmd;
};
