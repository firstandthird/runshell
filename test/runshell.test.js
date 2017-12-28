'use strict';
const tap = require('tap');
const path = require('path');
const runshell = require('../index.js');

tap.test('runs shellmmands', async(t) => {
  t.plan(1);
  const { results } = await runshell('node', {
    args: path.join(__dirname, 'expected', 'script1.js'),
  });
  t.equal(results, 'test\n');
});

tap.test('can log output', async(t) => {
  t.plan(2);
  const oldLog = console.log; // eslint-disable-line no-console
  const alldata = [];
  console.log = (results) => { // eslint-disable-line no-console
    alldata.push(results);
  };
  const { results } = await runshell('node', {
    args: path.join(__dirname, 'expected', 'script1.js'),
    log: true
  });
  console.log = oldLog; // eslint-disable-line no-console
  t.equal(results, 'test\n');
  t.equal(alldata[0], 'test\n');
});

tap.test('can log output with a custom logger', async(t) => {
  t.plan(1);
  await runshell('node', {
    args: path.join(__dirname, 'expected', 'script1.js'),
    logger: (msg) => {
      t.equal(msg, 'test\n');
    }
  });
});

tap.test('runs an executable script file', async(t) => {
  await runshell(path.join(__dirname, 'test-shell'), {
  });
});

tap.test('runs an executable with args passed as object', async(t) => {
  const { results } = await runshell(path.join(__dirname, 'test-shell'), {
    args: { v: 'another_thing', a: 'thing' }
  });
  t.equal(results.indexOf('-a') > -1, true);
  t.equal(results.indexOf('thing') > -1, true);
  t.equal(results.indexOf('-v') > -1, true);
  t.equal(results.indexOf('another_thing') > -1, true);
  t.end();
});

tap.test('handles the "timeout" option', async(t) => {
  try {
    await runshell(path.join(__dirname, 'test-shell-timeout'), {
      timeout: 1000
    });
  } catch (err) {
    t.equal(err.signal, 'SIGTERM');
    t.end();
  }
});

tap.test('layers process.env into env', async(t) => {
  const results1 = await runshell(path.join(__dirname, 'test-shell2'), {});
  t.equal(results1.results.indexOf(process.env.HOME) > -1, true, 'takes process.env by default');
  const results2 = await runshell(path.join(__dirname, 'test-shell2'), { env: { firstandthird_runshell: 'firstandthird_runshell' } });
  t.equal(results2.results.indexOf(process.env.HOME) > -1, true);
  t.equal(results2.results.indexOf('firstandthird_runshell') > -1, true, 'combines process.env with passed env');
  const oldHome = process.env.HOME;
  const results3 = await runshell(path.join(__dirname, 'test-shell2'), { env: { HOME: 'firstandthird_runshell' } });
  t.equal(results3.results.indexOf(oldHome), -1, 'passed env will over-ride process.env');
  t.end();
});

tap.test('handles errors', async(t) => {
  t.plan(1);
  try {
    await runshell('node', { args: 'no!' });
  } catch (err) {
    t.notEqual(err, null);
  }
});

tap.test('resolves childProcess, code and result', async (t) => {
  t.plan(3);
  const { childProcess, code, results } = await runshell('node', {
    args: path.join(__dirname, 'expected', 'script1.js')
  });
  t.equal(typeof childProcess, 'object');
  t.equal(typeof code, 'number');
  t.equal(typeof results, 'string');
});

tap.test('handles the "onMessage" option', async(t) => {
  t.plan(1);
  await runshell(path.join(__dirname, 'test-shell-ipc'), {
    onMessage: (msg) => {
      t.equal(msg, 'hello');
      t.end();
    }
  });
});
