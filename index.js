'use strict';
// const { fork } = require('child_process');
const cp = require('child_process');
const joi = require('joi');
const obj2args = require('obj2args');

// see
// https://nodejs.org/api/child_process.html#child_process_child_process
// for additional information

module.exports = (commandName, opts) => {
  // second argument is optional:
  if (!opts) {
    opts = {};
  }
  let args = opts.args ? obj2args(opts.args) : [];
  // make sure args is an array:
  if (typeof args === 'string') {
    args = [args];
  }
  delete opts.args;
  // properties in opts.env will over-ride the default process.env:
  if (opts.env) {
    opts.env = Object.assign(process.env, opts.env);
  } else {
    opts.env = process.env;
  }

  // if a custom logger was specified, assume opts.log is true:
  if (!opts.log) {
    if (opts.logger) {
      opts.log = true;
    }
  }
  // default logger is console.log or you can pass a custom one:
  opts.logger = opts.logger || console.log;
  const validation = joi.validate(opts, joi.object({
    // 'silent' mode guarantees stdon/stdout/stderr handlers are available when using fork:
    silent: joi.boolean().default(true),
    env: joi.object(),
    cwd: joi.string().default(process.cwd()),
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
  const options = validation.value;
  if (args.length > 0) {
    commandName = `${commandName} ${args.join(' ')}`;
  }
  if (options.verbose) {
    console.log(`Running ${commandName}`); //eslint-disable-line no-console
  }
  // launch with fork if IPC was requested:
  const launch = options.onMessage ? cp.fork : cp.spawn;
  const cmd = launch(commandName, options);
  const outputdata = [];
  const outputerr = [];

  return new Promise((resolve, reject) => {
    if (options.onMessage) {
      cmd.on('message', options.onMessage);
    }
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

    if (options.timeout) {
      setTimeout(() => {
        cmd.kill();
      }, options.timeout);
    }
  });
};
