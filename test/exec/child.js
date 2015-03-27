// a basic node http server
var port = Math.floor(Math.random() * 60000) + 1000;
// require('http').createServer(function (req, res) {
//   res.writeHead(200, {"Content-Type": "text/html"});
//   res.end('Hai');
// }).listen(port);
console.log("Visit: http://127.0.0.1:"+port);
console.log("process.id: "+process.pid);
console.log(" - - - - - - - - - - - - - - - - - - - - - - - ");
