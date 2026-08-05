const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  content = content.replace(/toLocaleDateString\('en-IN'\)/g, "toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })");
  content = content.replace(/toLocaleString\('en-IN'\)/g, "toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'short', timeStyle: 'short' })");
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  }
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
      replaceInFile(fullPath);
    }
  });
}

walk('./pages');
walk('./components');
console.log('Done.');
