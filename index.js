'use strict';
const { spawn } = require('child_process');
const joi = require('joi');
const obj2args = require('obj2args');

// see
// https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
// for additional options

module.exports = (commandName, options) => {
  // second argument is optional:
  if (!options) {
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

  // if a custom logger was specified, assume options.log is true:
  if (!options.log) {
    if (options.logger) {
      options.log = true;
    }
  }
  // default logger is console.log or you can pass a custom one:
  options.logger = options.logger || console.log;

  const validation = joi.validate(options, joi.object({
    env: joi.object(),
    cwd: joi.string(),
    logger: joi.func(),
    verbose: joi.boolean().optional(),
    shell: joi.boolean().default(true),
    setsid: joi.boolean().default(true),
    log: joi.boolean(),
    timeout: joi.number().optional(),
    onMessage: joi.func().optional()
  }));
  if (validation.error) {
    throw validation.error;
  }

  commandName = `${commandName} ${args.join(' ')}`;
  if (options.verbose) {
    console.log(`Running ${commandName}`); //eslint-disable-line no-console
  }
  const cmd = spawn(commandName, validation.value);
  const outputdata = [];
  const outputerr = [];

  return new Promise((resolve, reject) => {
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
        return reject({ code, signal, err: outputerr.join(''), msg: 'An error occured' });
      }
      return resolve({
        childProcess: cmd,
        code,
        results: outputdata.join('')
      });
    });

    if (options.onMessage) {
      cmd.on('message', options.onMessage);
    }

    if (options.timeout) {
      setTimeout(() => {
        cmd.kill();
      }, options.timeout);
    }
  });
};
