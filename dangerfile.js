const {danger, warn, message} = require('danger')
const fs = require('fs');
const spawnSync = require('child_process').spawnSync;


// No PR is too small to include a description of why you made a change
if (danger.github.pr.body.length < 10) {
  warn('Please include a description of your PR changes.');
}


// Check that someone has been assigned to this PR
if (danger.github.pr.assignee === null) {
   warn('Please assign someone to merge this PR, and optionally include people who should review.');
}


// encourage deleting code
if (danger.github.pr.deletions > danger.github.pr.additions) {
  message("🔥 Thanks for clearing out some code");
}

// No trailing whitespaces
const filenames = danger.git.modified_files.concat(danger.git.created_files)
for (index in filenames) {
  const filename = filenames[index];
  if (filename.indexOf(".tex") === -1 || !fs.existsSync(filename)) {
    continue;
  }
  const buf = fs.readFileSync(filename, "utf8");
  const lines = buf.split('\n');
  for (lineIndex in lines) {
    const line = lines[lineIndex]
    if (line[line.length - 1] == " ") {
      fail(filename + " contains trailing whitespaces @ line " + (parseInt(lineIndex) + 1));
    }
  }

  const check = spawnSync("lacheck", [filename]).stdout.toString('utf8');
  const checkLines = check.split('\n');
  for (lineIndex in checkLines) {
    const line = checkLines[lineIndex]
    if (line.length == 0 || line.includes("possible unwanted space at \"{\"") || line.includes("missing `\\ ' after \"")) {
      continue
    }
    warn(checkLines[lineIndex])
  }
}
