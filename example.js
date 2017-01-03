const runshell = require('./index.js');
const obj2args = require('obj2args');

const args = obj2args({ _: ['-al'] });
runshell('ls', { args }, (err, data) => {
  if (err) {
    return console.log(err);
  }
  console.log(data);
});
