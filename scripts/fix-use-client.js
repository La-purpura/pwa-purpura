const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all page.tsx files
const pageFiles = glob.sync('src/app/(app)/**/page.tsx', { cwd: process.cwd() });

let fixed = 0;
let skipped = 0;

pageFiles.forEach(filePath => {
    const fullPath = path.join(process.cwd(), filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if has onClick and doesn't have "use client"
    if (content.includes('onClick') && !content.includes('"use client"') && !content.includes("'use client'")) {
        // Add "use client" at the top
        content = '"use client";\n\n' + content;
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Fixed: ${filePath}`);
        fixed++;
    } else {
        skipped++;
    }
});

console.log(`\n✅ Fixed ${fixed} files`);
console.log(`⏭️  Skipped ${skipped} files`);
