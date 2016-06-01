#!/usr/bin/env node

'use strict';

var ppid
switch (process.platform) {
  case 'win32':
    ppid = 0
    break;
  default: // Linux
    ppid = 1
    break;
}
require('../')(process.argv[2] || ppid, function (err, data) {
  console.log(data);
});
