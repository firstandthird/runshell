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

  const cmd = spawn(commandName, options);
  if (options.returnCmd) {
    return cmd;
  }
  const outputdata = [];
  const outputerr = [];
  cmd.stdout.on('data', (data) => {
    outputdata.push(data);
    if (options.log) {
      console.log(data.toString()); // eslint-disable-line no-console
    }
  });
  cmd.stderr.on('data', (data) => {
    outputerr.push(data);
    if (options.log) {
      console.log(data.toString()); // eslint-disable-line no-console
    }
  });

  cmd.on('error', (err) => {
    console.log('ERROR: ', err); // eslint-disable-line no-console
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
};
