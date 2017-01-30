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

test('can log output', (t) => {
  t.plan(3);
  const oldLog = console.log;
  const alldata = [];
  console.log = (data) => {
    alldata.push(data);
  };
  runshell('node', {
    args: path.join(__dirname, 'expected', 'script1.js'),
    log: true
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

test('handles the "timeout" option', (t) => {
  runshell(path.join(__dirname, 'test-shell-timeout'), {
    timeout: 1000
  }, (err, dataStr) => {
    t.notEqual(err);
    t.equal(err.signal, 'SIGTERM');
    t.end();
  });
});

test('layers process.env into env', (t) => {
  runshell(path.join(__dirname, 'test-shell2'), {
  }, (err, dataStr) => {
    t.equal(err, null);
    t.equal(dataStr.indexOf(process.env.HOME) > -1, true, 'takes process.env by default');
    runshell(path.join(__dirname, 'test-shell2'), {
      env: { firstandthird_runshell: 'firstandthird_runshell' }
    }, (err2, dataStr2) => {
      t.equal(err2, null);
      t.equal(dataStr2.indexOf(process.env.HOME) > -1, true);
      t.equal(dataStr2.indexOf('firstandthird_runshell') > -1, true, 'combines process.env with passed env');
      const oldHome = process.env.HOME;
      runshell(path.join(__dirname, 'test-shell2'), {
        env: { HOME: 'firstandthird_runshell' }
      }, (err3, dataStr3) => {
        t.equal(err3, null);
        t.equal(dataStr3.indexOf(oldHome), -1, 'passed env will over-ride process.env');
        t.end();
      });
    });
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
