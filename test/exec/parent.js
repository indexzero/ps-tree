var path = require('path');
var cp = require('child_process');

var started = false;
var spawned = {};

for (var i = 0; i < 10; i++) {
  var child = cp.spawn('node', [path.join('test', 'exec', 'child.js')]);
  child.stdout.on('data', function (child) {
    spawned[child.pid] = true;
  }.bind(this, child));
}

setInterval(function() {
  if (started) return;
  if (Object.keys(spawned).length !== 10) return;
  console.log(process.pid);
  started = true;
}, 100); // Does nothing, but prevents exit
