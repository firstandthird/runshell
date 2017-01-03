const runshell = require('./index.js');

runshell('ls', {
  args: ['-al'],
  verbose: true
}, (err, data) => {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
