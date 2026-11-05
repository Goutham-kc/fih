const fs = require('fs');
let css = fs.readFileSync('styles/globals.css', 'utf8');
css = css.replace("cursor: url('/assets/ui/ui_atlas.png'), pointer;", "cursor: pointer;");
fs.writeFileSync('styles/globals.css', css);
console.log('Successfully updated cursor in styles/globals.css');
