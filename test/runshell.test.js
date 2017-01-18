'use strict';
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
  runshell(path.join(__dirname, 'test-shell'), {
    args: { v: 'another_thing', a: 'thing' },
    env: process.env
  }, (err, dataStr) => {
    t.equal(err, null);
    t.equal(dataStr.indexOf('-a') > -1, true);
    t.equal(dataStr.indexOf('thing') > -1, true);
    t.equal(dataStr.indexOf('-v') > -1, true);
    t.equal(dataStr.indexOf('another_thing') > -1, true);
    t.end();
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
