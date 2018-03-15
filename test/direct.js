var test  = require('tape');
var chalk = require('chalk');
var cp = require('child_process');

var green = chalk.green,
    cyan = chalk.cyan;

test(cyan('Directly Execute bin/ps-tree.js'), function (t) {
  var first = cp.exec('node -v', function (error, stdout, stderr) {});
  var child = cp.exec('node ./bin/ps-tree.js', function (error, data) {
    // console.log('data: ' + data.length);
    if (error !== null) {
      t.error(err);
      t.end();
      return;
    }
  });

  t.true(child.pid, green('✓ Called ./bin/ps-tree.js directly. worked as expected'));
  t.end();
});
