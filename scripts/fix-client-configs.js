const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

const stats = {
    fixed: 0,
    clientComponents: 0,
    serverComponents: 0
};

walk('src/app', (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf8');

    const isClientComponent = content.includes('"use client"') || content.includes("'use client'");

    if (isClientComponent) {
        stats.clientComponents++;
        let fixed = false;

        // Pattern to match export const dynamic = ... or export const revalidate = ...
        // and correctly handle multiline or spaces
        const dynamicRegex = /export const dynamic = ['"]force-dynamic['"];?\s*/g;
        const revalidateRegex = /export const revalidate = \d+;?\s*/g;

        if (dynamicRegex.test(content) || revalidateRegex.test(content)) {
            content = content.replace(dynamicRegex, '');
            content = content.replace(revalidateRegex, '');
            fs.writeFileSync(filePath, content);
            console.log(`✅ FIXED Client Component: ${filePath}`);
            stats.fixed++;
        }
    } else {
        stats.serverComponents++;
    }
});

console.log(`\nSummary:`);
console.log(`- Total files scanned: ${stats.clientComponents + stats.serverComponents}`);
console.log(`- Client Components: ${stats.clientComponents}`);
console.log(`- Server Components: ${stats.serverComponents}`);
console.log(`- Fixed (removed server config from client component): ${stats.fixed}`);
