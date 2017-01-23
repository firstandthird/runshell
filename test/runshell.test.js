'use strict';
const test = require('tape');
const path = require('path');
const runshell = require('../index.js');

test('runs shellmmands', (t) => {
  t.plan(2);
  runshell('node', {
    args: path.join(__dirname, 'expected', 'script1.js'),
  }, (err, data) => {
    t.equal(err, null);
    t.equal(data, 'test\n');
  });
});


test('runs shellmmands', (t) => {
  t.plan(2);
  runshell('node', {
    args: path.join(__dirname, 'expected', 'script1.js'),
  }, (err, data) => {
    t.equal(err, null);
    t.equal(data, 'test\n');
  });
});

test('can stream output', (t) => {
  t.plan(3);
  const oldLog = console.log;
  const alldata = [];
  console.log = (data) => {
    alldata.push(data);
  };
  runshell('node', {
    args: path.join(__dirname, 'expected', 'script1.js'),
    stream: true
  }, (err, data) => {
    console.log = oldLog;
    t.equal(err, null);
    t.equal(data, 'test\n');
    t.equal(alldata[0], 'test\n');
  });
});

test('runs an executable script file', (t) => {
  runshell(path.join(__dirname, 'test-shell'), {
  }, (err, dataStr) => {
    t.equal(err, null);
    t.end();
  });
});

test('runs an executable with args passed as object', (t) => {
  runshell(path.join(__dirname, 'test-shell'), {
    args: { v: 'another_thing', a: 'thing' }
  }, (err, dataStr) => {
    t.equal(err, null);
    t.equal(dataStr.indexOf('-a') > -1, true);
    t.equal(dataStr.indexOf('thing') > -1, true);
    t.equal(dataStr.indexOf('-v') > -1, true);
    t.equal(dataStr.indexOf('another_thing') > -1, true);
    t.end();
  });
});

test('layers process.env  args passed as object', (t) => {
  process.env.firstandthird_runshell = '123';
  runshell(path.join(__dirname, 'test-shell2'), {
  }, (err, dataStr) => {
    t.equal(err, null);
    t.equal(dataStr, '123');
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
