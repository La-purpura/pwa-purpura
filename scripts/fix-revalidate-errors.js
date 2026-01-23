const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 FIXING REVALIDATE ERRORS\n');

const pageFiles = glob.sync('src/app/(app)/**/page.tsx', { cwd: process.cwd() });

let fixed = 0;
let skipped = 0;

pageFiles.forEach(pagePath => {
    const fullPath = path.join(process.cwd(), pagePath);

    try {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;

        // Remove invalid revalidate exports (objects, etc)
        if (content.match(/export const revalidate\s*=\s*{/)) {
            content = content.replace(/export const revalidate\s*=\s*{[^}]*};?\n?/g, '');
            modified = true;
        }

        // Fix duplicate revalidate exports
        const revalidateMatches = content.match(/export const revalidate\s*=\s*0;?/g);
        if (revalidateMatches && revalidateMatches.length > 1) {
            // Keep only the first one
            let first = true;
            content = content.replace(/export const revalidate\s*=\s*0;?\n?/g, () => {
                if (first) {
                    first = false;
                    return 'export const revalidate = 0;\n';
                }
                return '';
            });
            modified = true;
        }

        // Fix duplicate dynamic exports
        const dynamicMatches = content.match(/export const dynamic\s*=\s*['"]force-dynamic['"];?/g);
        if (dynamicMatches && dynamicMatches.length > 1) {
            let first = true;
            content = content.replace(/export const dynamic\s*=\s*['"]force-dynamic['"];?\n?/g, () => {
                if (first) {
                    first = false;
                    return "export const dynamic = 'force-dynamic';\n";
                }
                return '';
            });
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`✅ Fixed: ${pagePath}`);
            fixed++;
        } else {
            skipped++;
        }
    } catch (error) {
        console.error(`❌ Error in ${pagePath}:`, error.message);
    }
});

console.log(`\n✅ Fixed: ${fixed} files`);
console.log(`⏭️  Skipped: ${skipped} files`);
