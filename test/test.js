var test  = require('tape');
var chalk = require('chalk');
var red = chalk.red, green = chalk.green, cyan = chalk.cyan;

var cp = require('child_process'),
    psTree = require('../')

test(cyan('Spawn a Parent Process which has a Two Child Processes'), function (t) {
  var child = cp.exec("node ./test/exec/parent.js", function(error, stdout, stderr) {
  })
  setTimeout(function(){
    psTree(child.pid, function (err, children) {
      if(err){
        console.log(err);
      }
      console.log("Children: ", children, '\n');
      t.equal(children.length, 2, green("✓ There are "+children.length+" active child processes"));
      cp.spawn('kill', ['-9'].concat(children.map(function (p) { return p.PID })))
    })
  },100); // using setTimeout to ensure the child process gets started

  setTimeout(function(){
    psTree(child.pid, function (err, children) {
      if(err){
        console.log(err);
      }
      // console.log("Children: ", children, '\n');
      // console.log(' ')
      t.equal(children.length, 0, green("✓ No more active child processes"));
      t.end();
    })
  },200); // ensure the child process was both started and killed by psTree
});

test(cyan('Attempt to call psTree without supplying a Callback'), function (t) {
  var child = cp.exec("node ../index.js 12345", function(error, stdout, stderr) {
  })
  var errmsg = "Error: childrenOfPid(pid, callback) expects callback"
  setTimeout(function(){
    try {
      psTree(child.pid); // attempt to call psTree without a callback
    }
    catch(e){
      console.log(red(e));
      t.equal(e.toString(), errmsg, green("✓ Fails when no callback supplied (as expected)"))
    }
    t.end();

  },100); // using setTimeout to ensure the child process gets started
});


test(cyan('Spawn a Child Process'), function (t) {
  var first = cp.exec("node ./test/exec/child.js", function(error, stdout, stderr) {
  })
  var child = cp.exec("node ../index.js '"+first.pid +"'", function(error, stdout, stderr) {
  })
  setTimeout(function(){
    psTree(first.pid, function (err, children) {
      if(err){
        console.log(err);
      }
      // console.log("Children: ", children, '\n');
      // t.equal(children.length, 2, green("✓ There are "+children.length+" active child processes"));
      cp.spawn('kill', ['-9'].concat(children.map(function (p) { return p.PID })))
    })
  },100); // using setTimeout to ensure the child process gets started

  setTimeout(function(){
    psTree(child.pid, function (err, children) {
      if(err){
        console.log(err);
      }
      // console.log("Children: ", children, '\n');
      // console.log(' ')
      t.equal(children.length, 0, green("✓ No more active child processes"));
      t.end();
    })
  },200); // ensure the child process was both started and killed by psTree
});
