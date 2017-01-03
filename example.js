const runshell = require('./index.js');

runshell('ls', {
  args: {
    _: ['-al']
  }
}, (err, data) => {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
