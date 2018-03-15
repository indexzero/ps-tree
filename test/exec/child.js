console.log(process.pid);
setInterval(function() {
  console.log(process.pid);
}, 1000); // Does nothing, but prevents exit
