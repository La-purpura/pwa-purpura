const fs = require('fs');
const path = require('path');

const apiRoutes = [
    'src/app/api/alerts/route.ts',
    'src/app/api/branches/route.ts',
    'src/app/api/territories/route.ts',
    'src/app/api/reports/route.ts',
    'src/app/api/reports/stats/route.ts',
    'src/app/api/auth/login/route.ts',
    'src/app/api/drafts/route.ts',
    'src/app/api/invites/route.ts',
    'src/app/api/kpis/route.ts',
    'src/app/api/me/route.ts',
    'src/app/api/news/route.ts',
    'src/app/api/offline-queue/route.ts',
    'src/app/api/projects/route.ts',
    'src/app/api/requests/route.ts',
    'src/app/api/requests/[id]/route.ts',
    'src/app/api/requests/[id]/approve/route.ts',
    'src/app/api/requests/[id]/reject/route.ts',
    'src/app/api/surveys/route.ts',
    'src/app/api/sync/route.ts',
    'src/app/api/tasks/route.ts',
    'src/app/api/users/route.ts',
    'src/app/api/posts/[id]/read/route.ts',
    'src/app/api/posts/[id]/reads/route.ts',
    'src/app/api/resources/[id]/route.ts',
    'src/app/api/incidents/[id]/route.ts',
];

apiRoutes.forEach(routePath => {
    const fullPath = path.join(process.cwd(), routePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${routePath} (not found)`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if already has dynamic export
    if (content.includes('export const dynamic')) {
        console.log(`✓ ${routePath} already has dynamic export`);
        return;
    }

    // Find the first import statement
    const lines = content.split('\n');
    let insertIndex = 0;

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
            insertIndex = i;
        } else if (insertIndex > 0 && !lines[i].trim().startsWith('import ') && lines[i].trim() !== '') {
            break;
        }
    }

    // Insert after last import
    lines.splice(insertIndex + 1, 0, '', "export const dynamic = 'force-dynamic';");

    fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
    console.log(`✅ Added dynamic export to ${routePath}`);
});

console.log('\n✅ All API routes updated!');
