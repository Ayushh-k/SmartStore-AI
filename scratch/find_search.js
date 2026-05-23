// scratch/find_search.js
import fs from 'fs';
import path from 'path';

const searchDir = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        searchDir(fullPath);
      }
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.toLowerCase().includes('search')) {
        console.log(`FOUND SEARCH IN: ${fullPath}`);
        // Log lines containing search inputs or search state
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (line.includes('<input') || line.includes('search') || line.includes('Search')) {
            console.log(`  L${idx + 1}: ${line.trim()}`);
          }
        });
      }
    }
  }
};

searchDir('c:/B-tech/Winter PEP/SmartStore/smartstore-ai/frontend/src');
