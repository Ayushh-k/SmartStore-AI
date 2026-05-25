import fs from 'fs';
import path from 'path';

const baseDir = 'c:/B-tech/Winter PEP/SmartStore/smartstore-ai';
const fileExtensions = ['.jsx', '.js', '.html'];
const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.gemini'];

const searchDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (!excludeDirs.includes(file)) {
        searchDir(fullPath);
      }
    } else if (fileExtensions.includes(path.extname(file))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('$')) {
        const lines = content.split('\n');
        let matches = [];
        lines.forEach((line, idx) => {
          // Check for literal '$' by making sure it's not part of '${' template strings
          // We look for '$' that is not followed immediately by '{'
          let pos = line.indexOf('$');
          while (pos !== -1) {
            if (line[pos + 1] !== '{') {
              matches.push({ lineNum: idx + 1, content: line.trim() });
              break;
            }
            pos = line.indexOf('$', pos + 1);
          }
        });
        if (matches.length > 0) {
          console.log(`FILE: ${fullPath.replace(baseDir, '')}`);
          matches.forEach(m => console.log(`  L${m.lineNum}: ${m.content}`));
        }
      }
    }
  }
};

searchDir(baseDir);
