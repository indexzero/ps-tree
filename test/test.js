var test  = require('tape');
var chalk = require('chalk');
var red = chalk.red, green = chalk.green, cyan = chalk.cyan;

var cp = require('child_process'),
    psTree = require('../')

test(cyan('Spawn a Parent process which has a Two Child Processes'), function (t) {
  var parent = cp.exec("node ./test/exec/parent.js", function(error, stdout, stderr) {
  })
  setTimeout(function(){
    psTree(parent.pid, function (err, children) {
      if(err){
        console.log(err);
      }
      console.log(red("Children: "), children, '\n');
      t.true(children.length > 0, green("✓ There are "+children.length+" active child processes"));
      cp.spawn('kill', ['-9'].concat(children.map(function (p) { return p.PID })))
    })
    setTimeout(function(){
      psTree(parent.pid, function (err, children) {
        if(err){
          console.log(err);
        }
        // console.log("Children: ", children, '\n');
        // console.log(' ')
        t.equal(children.length, 0, green("✓ No more active child processes (we killed them)"));
        t.end();
      })
    },500); // give psTree time to kill the processes
  },200); // give the child process time to spawn
});

test(cyan('FORCE ERROR by calling psTree without supplying a Callback'), function (t) {
  var errmsg = "Error: childrenOfPid(pid, callback) expects callback"
  try {
    psTree(1234); // attempt to call psTree without a callback
  }
  catch(e){
    // console.log(red(e));
    t.equal(e.toString(), errmsg, green("✓ Fails when no callback supplied (as expected)"))
  }
  t.end();
});


test(cyan('Spawn a Child Process and psTree with a String as pid'), function (t) {
  var child = cp.exec("node ./test/exec/child.js", function(error, stdout, stderr) { });
  psTree(child.pid.toString(), function (err, children) {
    if(err){
      console.log(err);
    }
    // t.equal(children.length, 1, green("✓ No more active child processes"));
    cp.spawn('kill', ['-9'].concat(children.map(function (p) { return p.PID })))
  })
  psTree(child.pid.toString(), function (err, children) {
    if(err){
      console.log(err);
    }
    t.equal(children.length, 0, green("✓ No more active child processes"));
    t.end();
  })
});

// test(cyan('Spawn a Child Process while true'), function (t) {
//   var child = cp.exec("node -e 'while (true);", function(error, stdout, stderr) { });
//   psTree(child.pid, function (err, children) {
//     if(err){
//       console.log(err);
//     }
//     // t.equal(children.length, 1, green("✓ No more active child processes"));
//     cp.spawn('kill', ['-9'].concat(children.map(function (p) { return p.PID })))
//   })
//   psTree(child.pid.toString(), function (err, children) {
//     if(err){
//       console.log(err);
//     }
//     t.equal(children.length, 0, green("✓ No more active child processes"));
//     t.end();
//   })
// });
