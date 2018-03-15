var path = require('path');
var test  = require('tape');
var chalk = require('chalk');
var cp = require('child_process');
var treeKill = require('tree-kill');
var psTree = require('../');

var green = chalk.green,
    cyan = chalk.cyan;

var scripts = {
  parent: path.join(__dirname, 'exec', 'parent.js'),
  child: path.join(__dirname, 'exec', 'child.js')
};

test(cyan('Spawn a Parent process which has a Two Child Processes'), function (t) {
  t.timeoutAfter(5000);
  var parent = cp.exec('node ' + scripts.parent, function (error, stdout, stderr) {});

  var started = false;
  parent.stdout.on('data', function (data) {
    if (started) return;
    started = true;

    psTree(parent.pid, function (err, children) {
      if (err) {
        t.error(err);
        t.end();
        return;
      }

      t.true(children.length > 0, green('✓ There are ' + children.length + ' active child processes'));

      treeKill(parent.pid, function(err) {
        if (err) {
          t.error(err);
          t.end();
          return;
        }

        psTree(parent.pid, function (err, children) {
          if (err) {
            t.error(err);
            t.end();
            return;
          }

          t.equal(children.length, 0, green('✓ No more active child processes (we killed them)'));
          t.end();
        });
      });
    });
  });
});

test(cyan('FORCE ERROR by calling psTree without supplying a Callback'), function (t) {
  var errmsg = 'Error: childrenOfPid(pid, callback) expects callback';

  // Attempt to call psTree without a callback
  try { psTree(1234); }
  catch (e) {
    t.equal(e.toString(), errmsg, green('✓ Fails when no callback supplied (as expected)'));
  }

  t.end();
});

test(cyan('Spawn a Child Process and psTree with a String as pid'), function (t) {
  t.timeoutAfter(5000);
  var child = cp.exec('node ' + scripts.child, function(error, stdout, stderr) {});

  var started = false;
  child.stdout.on('data', function (data) {
    if (started) return;
    started = true;

    psTree(child.pid, function (err, children) {
      if (err) {
        t.error(err);
        t.end();
        return;
      }
      treeKill(child.pid, function(err) {
        if (err) {
          t.error(err);
          t.end();
          return;
        }

        psTree(child.pid, function (err, children) {
          if (err) {
            t.error(err);
            t.end();
            return;
          }

          t.equal(children.length, 0, green('✓ No more active child processes'));
          t.end();
        });
      });
    });
  });
});
