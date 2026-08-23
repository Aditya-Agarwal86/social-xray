import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

const IGNORED_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.idea',
  '.vscode',
  'coverage',
]);

const SUSPICIOUS_PATTERNS = [
  { name: 'OpenAI Secret Key (sk-...)', regex: /sk-[a-zA-Z0-9]{20,}/ },
  { name: 'Google API Key (AIzaSy...)', regex: /AIzaSy[a-zA-Z0-9_-]{33}/ },
  { name: 'Hardcoded localhost with port', regex: /http:\/\/localhost:\d+/ },
  { name: 'Unresolved TODO comment', regex: /\/\/\s*TODO|\bTODO:/i },
];

let filesScanned = 0;
const violations: Array<{ file: string; line: number; type: string; snippet: string }> = [];

function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry.name)) continue;

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.env', '.css'].includes(ext) || entry.name.startsWith('.env')) {
        filesScanned++;
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          // Skip audit script itself
          if (entry.name === 'audit-submission.ts') return;

          for (const pattern of SUSPICIOUS_PATTERNS) {
            // Ignore localhost in markdown documentation
            if (pattern.name.includes('localhost') && ext === '.md') continue;

            if (pattern.regex.test(line)) {
              violations.push({
                file: path.relative(projectRoot, fullPath),
                line: index + 1,
                type: pattern.name,
                snippet: line.trim(),
              });
            }
          }
        });
      }
    }
  }
}

scanDirectory(projectRoot);

console.log(`\n🔍 AUDIT SCAN COMPLETE:`);
console.log(`- Files scanned: ${filesScanned}`);
console.log(`- Violations found: ${violations.length}\n`);

if (violations.length > 0) {
  console.error(`❌ VIOLATIONS DETECTED:`);
  for (const v of violations) {
    console.error(`  [${v.type}] in ${v.file}:${v.line} -> "${v.snippet}"`);
  }
  process.exit(1);
} else {
  console.log(`✅ ZERO hardcoded keys, secrets, or unresolved TODOs found!`);
  process.exit(0);
}
