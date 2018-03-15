var path = require('path');
var cp = require('child_process');

var test  = require('tape');
var treeKill = require('tree-kill');

var psTree = require('../');

var scripts = {
  parent: path.join(__dirname, 'exec', 'parent.js'),
  child: path.join(__dirname, 'exec', 'child.js')
};

test('Spawn a Parent process which has ten Child processes', function (t) {
  t.timeoutAfter(10000);
  var parent = cp.spawn('node', [scripts.parent]);

  var executed = false;
  parent.stdout.on('data', function (data) {
    if (executed) return;
    executed = true;

    psTree(parent.pid, function (error, children) {
      if (error) {
        t.error(error);
        t.end();
        return;
      }

      t.equal(children.length, 10, 'There should be 10 active child processes');
      if (children.length !== 10) {
        t.comment(parent.pid.toString());
        t.comment(JSON.stringify(children, null, 2));
      }

      treeKill(parent.pid, function(error) {
        if (error) {
          t.error(error);
          t.end();
          return;
        }

        psTree(parent.pid, function (error, children) {
          if (error) {
            t.error(error);
            t.end();
            return;
          }

          t.equal(children.length, 0, "There should be no active child processes after killing them");
          t.end();
        });
      });
    });
  });
});

test('Spawn a Child Process which has zero Child processes', function (t) {
  t.timeoutAfter(10000);
  var child = cp.spawn('node', [scripts.child]);

  var executed = false;
  child.stdout.on('data', function (data) {
    if (executed) return;
    executed = true;

    psTree(child.pid, function (error, children) {
      if (error) {
        t.error(error);
        t.end();
        return;
      }

      t.equal(children.length, 0, 'There should be no active child processes');
      if (children.length !== 0) {
        t.comment(child.pid.toString());
        t.comment(JSON.stringify(children, null, 2));
      }

      treeKill(child.pid, function(error) {
        if (error) {
          t.error(error);
          t.end();
          return;
        }
        t.end();
      });
    });
  });
});

test('Call psTree without supplying a Callback', function (t) {
  var errmsg = 'Error: childrenOfPid(pid, callback) expects callback';

  // Attempt to call psTree without a callback
  try {
    psTree(1234);
  } catch (e) {
    t.equal(e.toString(), errmsg);
  }

  t.end();
});

test('Directly Execute bin/ps-tree.js', function (t) {
  var child = cp.exec('node ./bin/ps-tree.js', function (error, data) {
    if (error !== null) {
      t.error(err);
      t.end();
      return;
    }
    t.end();
  });
});
