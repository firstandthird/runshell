'use strict';
const runshell = require('../index.js');

runshell('./dbg-test', {
  log: true
}, (err, data) => {
  if (err) {
    return console.log('Script Log: ', err); // eslint-disable-line no-console
  }

  console.log('Script Complete', data); // eslint-disable-line no-console
});
