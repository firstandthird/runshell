const spawn = require('child_process').spawn;

// see
// https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
// for additional options

module.exports = (commandName, options, callback) => {
  // second argument is optional:
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  let args = options.args || [];
  // make sure args is an array:
  if (typeof args === 'string') {
    args = [args];
  }
  options.env = options.env || {};
  options.cwd = options.cwd || process.cwd();
  const shellCommand = spawn(commandName, args, options);
  let outputString = '';
  let errorString = '';
  // collect normal output:
  shellCommand.stdout.on('data', (data) => {
    outputString += data.toString();
  });
  // collect error output:
  shellCommand.stderr.on('data', (data) => {
    errorString += data.toString();
  });
  // handle ending:
  shellCommand.on('close', (exitCode) => {
    const error = exitCode === 0 ? null : {
      exitCode,
      message: errorString
    };
    return callback(error, outputString);
  });
};
