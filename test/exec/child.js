var started = false;
setInterval(function() {
  if (started) return;
  console.log(process.pid);
  started = true;
}, 100); // Does nothing, but prevents exit
