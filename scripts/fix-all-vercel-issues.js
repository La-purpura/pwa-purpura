const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🔧 FIXING ALL VERCEL DEPLOYMENT ISSUES\n');

let stats = {
    apiRoutesFixed: 0,
    pagesFixed: 0,
    clientComponentsFixed: 0,
    skipped: 0,
    errors: 0
};

// ============================================
// PHASE 1: Fix ALL API Routes
// ============================================
console.log('📡 Phase 1: Fixing API Routes...\n');

const apiRoutes = glob.sync('src/app/api/**/route.ts', { cwd: process.cwd() });

apiRoutes.forEach(routePath => {
    const fullPath = path.join(process.cwd(), routePath);

    try {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Skip if already has dynamic export
        if (content.includes('export const dynamic')) {
            console.log(`  ⏭️  ${routePath} (already configured)`);
            stats.skipped++;
            return;
        }

        // Find position after imports
        const lines = content.split('\n');
        let insertIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ')) {
                insertIndex = i;
            } else if (insertIndex > 0 && !lines[i].trim().startsWith('import ') && lines[i].trim() !== '') {
                break;
            }
        }

        // Insert dynamic export after imports
        lines.splice(insertIndex + 1, 0, '', "export const dynamic = 'force-dynamic';");

        fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
        console.log(`  ✅ ${routePath}`);
        stats.apiRoutesFixed++;
    } catch (error) {
        console.error(`  ❌ Error in ${routePath}:`, error.message);
        stats.errors++;
    }
});

// ============================================
// PHASE 2: Fix ALL Pages in (app)
// ============================================
console.log('\n📄 Phase 2: Fixing Pages...\n');

const pageFiles = glob.sync('src/app/(app)/**/page.tsx', { cwd: process.cwd() });

pageFiles.forEach(pagePath => {
    const fullPath = path.join(process.cwd(), pagePath);

    try {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Skip if already has dynamic export
        if (content.includes('export const dynamic')) {
            stats.skipped++;
            return;
        }

        // Check if it's a Client Component
        const isClientComponent = content.includes('"use client"') || content.includes("'use client'");

        if (isClientComponent) {
            // Client components don't need dynamic export
            stats.skipped++;
            return;
        }

        // Add dynamic export at the top (after "use client" if exists, or at very top)
        const lines = content.split('\n');
        let insertIndex = 0;

        // Find first non-empty, non-comment line
        for (let i = 0; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
                insertIndex = i;
                break;
            }
        }

        lines.splice(insertIndex, 0, "export const dynamic = 'force-dynamic';", "export const revalidate = 0;", '');

        fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
        console.log(`  ✅ ${pagePath}`);
        stats.pagesFixed++;
    } catch (error) {
        console.error(`  ❌ Error in ${pagePath}:`, error.message);
        stats.errors++;
    }
});

// ============================================
// PHASE 3: Fix Pages with Event Handlers
// ============================================
console.log('\n🖱️  Phase 3: Fixing Event Handler Issues...\n');

pageFiles.forEach(pagePath => {
    const fullPath = path.join(process.cwd(), pagePath);

    try {
        let content = fs.readFileSync(fullPath, 'utf8');

        // Check if has event handlers but no "use client"
        const hasEventHandlers = /onClick|onChange|onSubmit|onFocus|onBlur|onKeyDown|onKeyUp/.test(content);
        const hasUseClient = content.includes('"use client"') || content.includes("'use client'");

        if (hasEventHandlers && !hasUseClient) {
            // Add "use client" at the very top
            content = '"use client";\n\n' + content;

            // Remove dynamic exports (client components don't need them)
            content = content.replace(/export const dynamic = ['"]force-dynamic['"];?\n?/g, '');
            content = content.replace(/export const revalidate = 0;?\n?/g, '');

            fs.writeFileSync(fullPath, content, 'utf8');
            console.log(`  ✅ ${pagePath} (converted to Client Component)`);
            stats.clientComponentsFixed++;
        }
    } catch (error) {
        console.error(`  ❌ Error in ${pagePath}:`, error.message);
        stats.errors++;
    }
});

// ============================================
// PHASE 4: Fix Main Layout
// ============================================
console.log('\n🏗️  Phase 4: Fixing Main Layout...\n');

const layoutPath = 'src/app/(app)/layout.tsx';
const fullLayoutPath = path.join(process.cwd(), layoutPath);

if (fs.existsSync(fullLayoutPath)) {
    try {
        let content = fs.readFileSync(fullLayoutPath, 'utf8');

        if (!content.includes('export const dynamic')) {
            const lines = content.split('\n');
            let insertIndex = 0;

            // Find position after imports
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith('import ')) {
                    insertIndex = i;
                } else if (insertIndex > 0 && !lines[i].trim().startsWith('import ') && lines[i].trim() !== '') {
                    break;
                }
            }

            lines.splice(insertIndex + 1, 0, '', "export const dynamic = 'force-dynamic';", "export const revalidate = 0;");

            fs.writeFileSync(fullLayoutPath, lines.join('\n'), 'utf8');
            console.log(`  ✅ ${layoutPath}`);
        } else {
            console.log(`  ⏭️  ${layoutPath} (already configured)`);
        }
    } catch (error) {
        console.error(`  ❌ Error in ${layoutPath}:`, error.message);
        stats.errors++;
    }
}

// ============================================
// SUMMARY
// ============================================
console.log('\n' + '='.repeat(50));
console.log('📊 SUMMARY');
console.log('='.repeat(50));
console.log(`✅ API Routes Fixed: ${stats.apiRoutesFixed}`);
console.log(`✅ Pages Fixed: ${stats.pagesFixed}`);
console.log(`✅ Client Components Fixed: ${stats.clientComponentsFixed}`);
console.log(`⏭️  Skipped: ${stats.skipped}`);
console.log(`❌ Errors: ${stats.errors}`);
console.log('='.repeat(50));

if (stats.errors === 0) {
    console.log('\n🎉 ALL FIXES APPLIED SUCCESSFULLY!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run: npm run build');
    console.log('   2. Verify build completes successfully');
    console.log('   3. Commit and push changes');
} else {
    console.log('\n⚠️  Some errors occurred. Please review above.');
    process.exit(1);
}
