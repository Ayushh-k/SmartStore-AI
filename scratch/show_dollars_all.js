import fs from 'fs';
import path from 'path';

const baseDir = 'c:/B-tech/Winter PEP/SmartStore/smartstore-ai';
const fileExtensions = ['.jsx', '.js'];
const excludeDirs = ['node_modules', '.git', 'dist', 'build', '.gemini'];

const filesToScan = [
  'backend/controllers/storeController.js',
  'backend/controllers/userAiController.js',
  'backend/utils/mailer.js',
  'frontend/src/pages/Cart.jsx',
  'frontend/src/pages/Checkout.jsx',
  'frontend/src/pages/Products.jsx',
  'frontend/src/pages/ProductPage.jsx',
  'frontend/src/pages/Storefront.jsx',
  'frontend/src/pages/UserProfile.jsx',
  'frontend/src/pages/developer/UserManagement.jsx',
  'frontend/src/pages/developer/StoreManagement.jsx',
  'frontend/src/pages/developer/GlobalProducts.jsx',
  'frontend/src/pages/developer/PlatformOverview.jsx',
  'frontend/src/components/ProductDetails.jsx'
];

filesToScan.forEach(relPath => {
  const fullPath = path.join(baseDir, relPath);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  let matches = [];
  lines.forEach((line, idx) => {
    if (line.includes('$')) {
      const trimmed = line.trim();
      // Look for indicators of currency: e.g. contains '$' and '{', or '$' and numbers, or '$' at the beginning/end of a markup tag
      // Avoid Mongo query operators ($gte, $lte, $match, etc.)
      const isMongoOperator = trimmed.includes('$gte') || trimmed.includes('$lte') || 
                              trimmed.includes('$match') || trimmed.includes('$group') || 
                              trimmed.includes('$sum') || trimmed.includes('$ne') || 
                              trimmed.includes('$in') || trimmed.includes('$or') ||
                              trimmed.includes('$set') || trimmed.includes('$pull') ||
                              trimmed.includes('$addToSet') || trimmed.includes('$inc') ||
                              trimmed.includes('$exists');
      const isBearerToken = trimmed.includes('`Bearer');
      const isEnvironmentVar = trimmed.includes('process.env');
      const isRegex = trimmed.includes('replace') || trimmed.includes('regex');
      
      if (!isMongoOperator && !isBearerToken && !isEnvironmentVar && !isRegex) {
        matches.push({ lineNum: idx + 1, content: trimmed });
      }
    }
  });
  if (matches.length > 0) {
    console.log(`FILE: ${relPath}`);
    matches.forEach(m => console.log(`  L${m.lineNum}: ${m.content}`));
  }
});
