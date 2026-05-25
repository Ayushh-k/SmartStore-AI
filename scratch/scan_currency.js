import fs from 'fs';
import path from 'path';

const baseDir = 'c:/B-tech/Winter PEP/SmartStore/smartstore-ai';
const files = [
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

files.forEach(file => {
  const fullPath = path.join(baseDir, file);
  if (!fs.existsSync(fullPath)) return;
  const content = fs.readFileSync(fullPath, 'utf8');
  const lines = content.split('\n');
  let matches = [];
  lines.forEach((line, idx) => {
    // Check for currency patterns:
    // 1. Literal $ followed by $ e.g. $${
    // 2. Literal $ followed by a number e.g. $50, $29
    // 3. Literal $ followed by { when NOT inside template strings (no backtick on the line, or outside backtick block)
    // 4. Literal $ inside a string in JSX, e.g. "Total: $"
    let isCurrency = false;
    let trimmed = line.trim();
    
    if (trimmed.includes('$${')) {
      isCurrency = true;
    } else if (/\$[0-9]/.test(trimmed)) {
      isCurrency = true;
    } else if (trimmed.includes('${') && !trimmed.includes('`')) {
      // If it contains ${ and NO backtick, it's JSX dollar-curly (literal $ + JSX expression)
      isCurrency = true;
    } else if (trimmed.includes('Total: $') || trimmed.includes('Price: $')) {
      isCurrency = true;
    }
    
    // Filter out Mongo operators/JWT headers
    if (isCurrency) {
      const isMongo = trimmed.includes('$gte') || trimmed.includes('$lte') || 
                      trimmed.includes('$match') || trimmed.includes('$group') || 
                      trimmed.includes('$sum') || trimmed.includes('$ne') || 
                      trimmed.includes('$in') || trimmed.includes('$or') ||
                      trimmed.includes('$set') || trimmed.includes('$pull') ||
                      trimmed.includes('$addToSet') || trimmed.includes('$inc');
      if (!isMongo) {
        matches.push({ lineNum: idx + 1, content: trimmed });
      }
    }
  });
  
  if (matches.length > 0) {
    console.log(`FILE: ${file}`);
    matches.forEach(m => console.log(`  L${m.lineNum}: ${m.content}`));
  }
});
