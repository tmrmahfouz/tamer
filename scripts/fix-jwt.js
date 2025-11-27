const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '..', 'app', 'api');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if file needs fixing
  if (!content.includes("const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'")) {
    return false;
  }
  
  // Remove old imports and JWT_SECRET
  content = content.replace(/import jwt from 'jsonwebtoken'\n/g, '');
  content = content.replace(/const JWT_SECRET = process\.env\.JWT_SECRET \|\| 'your-secret-key'\n/g, '');
  
  // Add new import if not exists
  if (!content.includes("import { verifyToken } from '@/lib/jwt'")) {
    content = content.replace(
      "import { NextRequest, NextResponse } from 'next/server'",
      "import { NextRequest, NextResponse } from 'next/server'\nimport { verifyToken } from '@/lib/jwt'"
    );
  }
  
  // Replace jwt.verify calls
  content = content.replace(/const decoded = jwt\.verify\(token, JWT_SECRET\) as any/g, 
    `const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح' },
        { status: 401 }
      )
    }`);
  
  content = content.replace(/jwt\.verify\(token, JWT_SECRET\)/g, 'verifyToken(token)');
  
  fs.writeFileSync(filePath, content);
  return true;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let fixed = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      fixed += walkDir(filePath);
    } else if (file === 'route.ts') {
      if (fixFile(filePath)) {
        console.log('Fixed:', filePath);
        fixed++;
      }
    }
  }
  
  return fixed;
}

const fixed = walkDir(apiDir);
console.log(`\nTotal files fixed: ${fixed}`);
