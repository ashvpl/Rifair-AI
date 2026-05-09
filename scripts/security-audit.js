#!/usr/bin/env node
/**
 * Rifair AI — Enterprise Security Audit
 *
 * Checks for:
 *   1. Real secrets hardcoded in source files
 *   2. Banned AI SDK imports in frontend code
 *   3. NEXT_PUBLIC_ misuse (secret names in public vars)
 *   4. Direct process.env access outside allowed files
 *   5. console.log leaking env/secrets
 *   6. .env files staged for commit
 *   7. Frontend importing server-only modules
 *
 * Exit 0 = clean. Exit 1 = issues found (blocks commit).
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Configuration ────────────────────────────────────────────────────────────

/** Regex patterns that match real secret values */
const SECRET_PATTERNS = [
  { re: /gsk_[a-zA-Z0-9]{40,}/g,                                        name: 'Groq API Key' },
  { re: /AIzaSy[a-zA-Z0-9\-_]{33}/g,                                    name: 'Gemini API Key' },
  { re: /sk-ant-api03-[a-zA-Z0-9\-_]{80,}/g,                            name: 'Anthropic API Key' },
  { re: /sk-proj-[a-zA-Z0-9\-_]{80,}/g,                                 name: 'OpenAI API Key' },
  { re: /rzp_(test|live)_[a-zA-Z0-9]{14}/g,                             name: 'Razorpay Key' },
  // Supabase JWTs (long base64 JWT — service role format)
  { re: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9\-_]{80,}\.[a-zA-Z0-9\-_]{40,}/g, name: 'Supabase JWT' },
  { re: /sk_test_[a-zA-Z0-9]{30,}/g,                                    name: 'Clerk Secret Key' },
  { re: /sk_live_[a-zA-Z0-9]{30,}/g,                                    name: 'Clerk Live Secret Key' },
];

/** AI SDK package imports that must NEVER appear in frontend */
const BANNED_FRONTEND_IMPORTS = [
  '@google/generative-ai',
  '@anthropic-ai/sdk',
  'openai',
  'groq-sdk',
  '@groq/sdk',
];

/** Files that are the ONLY permitted direct process.env readers */
const ALLOWED_ENV_ACCESS = new Set([
  path.normalize('backend/src/core/config/env.ts'),
  path.normalize('frontend/lib/env.ts'),
  path.normalize('frontend/lib/server-config.ts'),
  path.normalize('frontend/lib/config.ts'),
  path.normalize('frontend/lib/supabase-admin.ts'),
  path.normalize('frontend/lib/supabase.ts'),
]);

/** Extensions to scan */
const SCAN_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

/** Directories to skip */
const SKIP_DIRS = new Set([
  'node_modules', 'node_modules_backup', '.git', '.next',
  'dist', 'build', 'out', 'coverage', '.turbo', 'scripts',
  // Skip test files in frontend (they run outside Next.js context)
]);

/** Files to skip entirely */
const SKIP_FILES = new Set([
  // These test files use process.env legitimately outside Next.js
]);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

function relativePath(filePath) {
  return path.relative(process.cwd(), filePath);
}

function isFrontendFile(rel) {
  return rel.startsWith('frontend') && !rel.includes('node_modules');
}

function isBackendFile(rel) {
  return rel.startsWith('backend') && !rel.includes('node_modules');
}

function isTestFile(rel) {
  return /\/(test_|tester|scratch)/.test(rel) || rel.endsWith('.test.ts') || rel.endsWith('.spec.ts');
}

function walkDir(dir, callback) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.env') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walkDir(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

// ─── Checks ──────────────────────────────────────────────────────────────────

function checkSecretPatterns(content, rel, issues) {
  // Skip .env files and .env.example
  if (rel.endsWith('.env.example') || rel.endsWith('.env.local.example')) return;
  // Skip actual .env files (expected to have secrets, just must not be committed)
  if (path.basename(rel) === '.env' || path.basename(rel).startsWith('.env.')) return;

  for (const { re, name } of SECRET_PATTERNS) {
    const fresh = new RegExp(re.source, re.flags);
    const matches = content.match(fresh);
    if (matches) {
      const masked = matches[0].slice(0, 6) + '****';
      issues.push({
        severity: 'CRITICAL',
        type: 'HARDCODED_SECRET',
        file: rel,
        message: `Found hardcoded ${name}: "${masked}..."`,
      });
    }
  }
}

function checkBannedFrontendImports(content, rel, issues) {
  if (!isFrontendFile(rel)) return;
  // Skip test files — they run server-side manually
  if (isTestFile(rel)) return;

  for (const pkg of BANNED_FRONTEND_IMPORTS) {
    if (content.includes(`from "${pkg}"`) || content.includes(`from '${pkg}'`) ||
        content.includes(`require("${pkg}")`) || content.includes(`require('${pkg}')`)) {
      issues.push({
        severity: 'CRITICAL',
        type: 'BANNED_FRONTEND_IMPORT',
        file: rel,
        message: `Frontend file imports server-side AI SDK: "${pkg}"`,
      });
    }
  }
}

function checkNextPublicMisuse(content, rel, issues) {
  if (!isFrontendFile(rel)) return;
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    // Detect NEXT_PUBLIC_ vars that have secret-sounding names
    if (
      trimmed.includes('NEXT_PUBLIC_') &&
      (trimmed.includes('SECRET') || trimmed.includes('PRIVATE') ||
       trimmed.includes('SERVICE_ROLE') || trimmed.includes('GROQ') ||
       trimmed.includes('GEMINI') || trimmed.includes('OPENAI')) &&
      !trimmed.startsWith('//')  &&
      !trimmed.startsWith('*')
    ) {
      issues.push({
        severity: 'CRITICAL',
        type: 'NEXT_PUBLIC_MISUSE',
        file: rel,
        line: i + 1,
        message: `NEXT_PUBLIC_ variable with secret name on line ${i + 1}: ${trimmed.slice(0, 80)}`,
      });
    }
  });
}

function checkDirectEnvAccess(content, rel, issues) {
  // Only flag files that are not the allowed env-readers
  const norm = path.normalize(rel);
  if (ALLOWED_ENV_ACCESS.has(norm)) return;
  // Skip test files
  if (isTestFile(rel)) return;
  // Skip .js test scripts at root
  if (!rel.includes('/') || rel.startsWith('scripts/')) return;

  const lines = content.split('\n');
  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed.includes('process.env.') && !trimmed.startsWith('//') && !trimmed.startsWith('*')) {
      // Allow process.env.NODE_ENV everywhere — it's not a secret
      const match = trimmed.match(/process\.env\.(\w+)/);
      if (match && match[1] !== 'NODE_ENV') {
        issues.push({
          severity: 'HIGH',
          type: 'DIRECT_ENV_ACCESS',
          file: rel,
          line: i + 1,
          message: `Direct process.env.${match[1]} access outside allowed files — use SecretManager or env.ts`,
        });
      }
    }
  });
}

function checkSecretLogging(content, rel, issues) {
  if (isTestFile(rel)) return;
  const dangerous = [
    'console.log(process.env)',
    'console.log(env)',
    'console.log(secrets',
    'console.dir(process.env)',
    'console.log(req.headers)',
    'console.log(apiKey',
    'console.log(key',
  ];
  for (const pattern of dangerous) {
    if (content.includes(pattern)) {
      issues.push({
        severity: 'HIGH',
        type: 'SECRET_LOGGING',
        file: rel,
        message: `Possible secret logging detected: \`${pattern}\``,
      });
    }
  }
}

// ─── Staged .env check (pre-commit) ─────────────────────────────────────────

function checkStagedEnvFiles(issues) {
  try {
    const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    const stagedFiles = staged.split('\n').filter(Boolean);
    for (const f of stagedFiles) {
      const base = path.basename(f);
      if (base === '.env' || base.startsWith('.env.') && !base.endsWith('.example')) {
        issues.push({
          severity: 'CRITICAL',
          type: 'ENV_FILE_STAGED',
          file: f,
          message: `Secret file staged for commit: "${f}" — this must NEVER be committed!`,
        });
      }
    }
  } catch {
    // Not in a git repo or git not available — skip
  }
}

// ─── Runner ──────────────────────────────────────────────────────────────────

console.log('\n🔍 Rifair AI — Security Audit\n');

const issues = [];

// Check staged files first
checkStagedEnvFiles(issues);

// Walk the codebase
walkDir(process.cwd(), (filePath) => {
  const rel = relativePath(filePath);
  const ext = path.extname(filePath);

  if (!SCAN_EXTENSIONS.has(ext)) return;
  if (rel.includes('node_modules')) return;
  if (rel.includes('node_modules_backup')) return;

  const content = readFileSafe(filePath);
  if (!content) return;

  checkSecretPatterns(content, rel, issues);
  checkBannedFrontendImports(content, rel, issues);
  checkNextPublicMisuse(content, rel, issues);
  checkDirectEnvAccess(content, rel, issues);
  checkSecretLogging(content, rel, issues);
});

// ─── Output ──────────────────────────────────────────────────────────────────

if (issues.length === 0) {
  console.log('✅ Security audit passed — no issues found.\n');
  process.exit(0);
}

const criticals = issues.filter(i => i.severity === 'CRITICAL');
const highs     = issues.filter(i => i.severity === 'HIGH');

console.log(`❌ Found ${issues.length} issue(s) — ${criticals.length} CRITICAL, ${highs.length} HIGH\n`);

const colors = { CRITICAL: '\x1b[31m', HIGH: '\x1b[33m', RESET: '\x1b[0m' };

issues.forEach((issue, idx) => {
  const color = colors[issue.severity] ?? '';
  console.log(`${color}[${issue.severity}] ${issue.type}${colors.RESET}`);
  console.log(`  File: ${issue.file}${issue.line ? `:${issue.line}` : ''}`);
  console.log(`  ${issue.message}`);
  console.log('');
});

if (criticals.length > 0) {
  console.log('🚨 CRITICAL issues detected. Commit BLOCKED.\n');
  process.exit(1);
}

// High-only — warn but allow
console.log('⚠️  High-severity issues detected. Review before deploying.\n');
process.exit(0);
