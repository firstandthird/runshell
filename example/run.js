const runshell = require('../index.js');

runshell('tail', {
  args: { f: 'index.js' }
}, (err, data) => {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
