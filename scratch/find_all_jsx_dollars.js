import fs from 'fs';
import path from 'path';

const baseDir = 'c:/B-tech/Winter PEP/SmartStore/smartstore-ai';
const fileExtensions = ['.jsx', '.js'];
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
          if (line.includes('$')) {
            // Keep lines that look like currency rendering:
            // e.g. contains '$' and '{' or '$' and numbers, or '$' in text
            const trimmed = line.trim();
            // Exclude common template literals/regex/mongo variables that are clearly not currency
            const isMongoOrRegexp = trimmed.startsWith('$') || 
                                    trimmed.includes('process.env') || 
                                    trimmed.includes('regex') ||
                                    trimmed.includes('replace') ||
                                    trimmed.includes('db.') ||
                                    trimmed.includes('findOne') ||
                                    trimmed.includes('$group') ||
                                    trimmed.includes('$sum') ||
                                    trimmed.includes('$match') ||
                                    trimmed.includes('$lte') ||
                                    trimmed.includes('$gte') ||
                                    trimmed.includes('$ne') ||
                                    trimmed.includes('$in') ||
                                    trimmed.includes('`Bearer');
            if (!isMongoOrRegexp) {
              matches.push({ lineNum: idx + 1, content: trimmed });
            }
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
