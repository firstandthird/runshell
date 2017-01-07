const test = require('tape');
const path = require('path');
const runshell = require('../index.js');

test('runs shell commands', (t) => {
  t.plan(2);
  runshell('node', {
    args: path.join(__dirname, 'expected', 'script1.js')
  }, (err, data) => {
    t.equal(err, null);
    t.equal(data, 'test\n');
  });
});

test('runs commands with args passed as object', (t) => {
  t.plan(2);
  runshell('node', {
    args: { v: true }
  }, (err, data) => {
    t.equal(err, null);
    t.equal(data, 'v6.7.0\r\n');
  });
});

test('handles errors', (t) => {
  t.plan(1);
  runshell('node', {
    args: 'no!'
  }, (err, data) => {
    t.notEqual(err, null);
  });
});
