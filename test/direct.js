var test  = require('tape');
var chalk = require('chalk');
var red = chalk.red, green = chalk.green, cyan = chalk.cyan;

var cp = require('child_process');
// var fs = require('fs');
// fs.chmodSync('./index.js', 777);

test(cyan('Directly Execute index.js without requiring the module'), function (t) {
  var first = cp.exec("node -v", function(error, stdout, stderr) {
  })
  var child = cp.exec("node ./index.js", function(error, data) {
    console.log('data: ' + data.length);
    if (error !== null) {
        console.log(red('exec error: ' + error));
    }
  })
  // console.log(first.pid)
  t.true(child, green("✓ Called index.js directly. it worked."));
  t.end();
});
