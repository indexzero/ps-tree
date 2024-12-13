'use strict';

const spawn = require('child_process').spawn;
const es    = require('event-stream');

module.exports = function childrenOfPid(pid, callback) {
  let headers = null;

  if (typeof callback !== 'function') {
    throw new Error('childrenOfPid(pid, callback) expects callback');
  }

  if (typeof pid === 'number') {
    pid = pid.toString();
  }

  //
  // The `ps-tree` module behaves differently on *nix vs. Windows
  // by spawning different programs and parsing their output.
  //
  // Linux:
  // 1. " <defunct> " need to be striped
  // ```bash
  // $ ps -A -o comm,ppid,pid,stat
  // COMMAND          PPID   PID STAT
  // bbsd             2899 16958 Ss
  // watch <defunct>  1914 16964 Z
  // ps              20688 16965 R+
  // ```
  //
  // Darwin:
  // $ ps -A -o comm,ppid,pid,stat
  // COMM              PPID   PID STAT
  // /sbin/launchd        0     1 Ss
  // /usr/libexec/Use     1    43 Ss
  //
  // Win32:
  // 1. powershell Get-WmiObject -Class Win32_Process | Select-Object -Property Name,ProcessId,ParentProcessId,Status | Format-Table
  // 2. Name column content may contain spaces; columns have a fixed width;
  //    status column ist usually empty. Output contains empty lines and dashes under the header.
  // ```shell
  // > powershell Get-WmiObject -Class Win32_Process | Select-Object -Property Name,ProcessId,ParentProcessId,Status | Format-Table
  // Name                         ProcessId ParentProcessId Status
  // ----                         --------- --------------- ------
  // System Idle Process                  0               0
  // System                               4               0
  // Secure System                      188               4
  // Registry                           232               4
  // smss.exe                           760               4
  // ```

  let processLister;
  if (process.platform === 'win32') {
    // WMIC is deprecated since 2016; using powershell 5.1
    processLister = spawn('powershell.exe',['Get-WmiObject -Class Win32_Process | Select-Object -Property Name,ProcessId,ParentProcessId,Status | Format-Table']);
  } else {
    processLister = spawn('ps', ['-A', '-o', 'ppid,pid,stat,comm']);
  }

  es.connect(
    // spawn('ps', ['-A', '-o', 'ppid,pid,stat,comm']).stdout,
    processLister.stdout,
    es.split(),
    es.map(function (line, cb) { //this could parse a lot of unix command output
      const trimmedLine = line.trim();

      // Windows: remove unnecessary lines created by powershell
      if ((trimmedLine.length === 0) || trimmedLine.includes('----')) {
        return cb();
      }

      /**
       * The first line contains the column headers. All columns have a fixed width.
       * Windows: COMMANDs may contain white spaces; therefore we cannot simply
       *          split the lines using white spaces as separators.
       */
      if (headers === null) {
        headers = getColumnDefs(trimmedLine);

        // For compatibility rename windows header names to the linux header names.
        headers = headers.map(header => {
          header.header = normalizeHeader(header.header);
          return header;
        });
        return cb();
      }

      let row = {};
      for (const headerDef of headers) {
        const columnValue = trimmedLine.substring(headerDef.start, headerDef.end).trim();
        row[headerDef.header] = columnValue;
      }

      return cb(null, row);
    }),
    es.writeArray(function (err, ps) {
      var parents = {},
          children = [];

      parents[pid] = true;
      ps.forEach(function (proc) {
        if (parents[proc.PPID]) {
          parents[proc.PID] = true;
          children.push(proc)
        }
      });

      callback(null, children);
    })
  ).on('error', callback)
}

  /**
   * Extract the column definitions from the first line into an array of objects.
   * Object structure:
   * {
   *    start: index of the first character of the column,
   *    end: index of the first character after the column,
   *    header: text of the column header
   * }
   * On Linux: the first column header is right aligned.
   * On Windows: the first column header is left aligned.
   * @param {string} line - string with the headers of the columns
   * @returns {Object[]} Array of objects containing the definition of 1 column
   */
  function getColumnDefs(line) {
    const columnDefinitions = [];
    let startOfColumnIncl = 0;
    let endOfColumnExcl = 0;
    let foundStartOfHeader = false;
    let foundEndOfHeader = false;
    for (let i = 0; i < line.length; i++) {
      const isWhitespace = line.substring(i, i + 1).trim() === '';
      if (!foundStartOfHeader && !isWhitespace) {
        // search for first header, if it is right aligned (on linux)
        foundStartOfHeader = true;
      } else if (foundStartOfHeader && isWhitespace) {
        // search for end of header text
        foundEndOfHeader = true;
      } else if (foundEndOfHeader && !isWhitespace) {
        endOfColumnExcl = i - 1;
        const header = line.substring(startOfColumnIncl, endOfColumnExcl).trim();
        columnDefinitions.push({start:startOfColumnIncl, end:endOfColumnExcl, header:header});
        startOfColumnIncl = i;
        foundStartOfHeader = true;
        foundEndOfHeader = false;
      }
    }

    // last column
    const header = line.substring(startOfColumnIncl, line.length).trim();
    columnDefinitions.push({start:startOfColumnIncl, end:line.length, header:header});
    return columnDefinitions;
  }

/**
 * Normalizes the given header `str` from the Windows
 * title to the *nix title.
 *
 * @param {string} str Header string to normalize
 */
function normalizeHeader(str) {
  switch (str) {
    case 'Name':  // for win32
    case 'COMM':  // for darwin
      return 'COMMAND';
      break;
    case 'ParentProcessId':
      return 'PPID';
      break;
    case 'ProcessId':
      return 'PID';
      break;
    case 'Status':
      return 'STAT';
      break;
    default:
      return str
  }
}
