#!/usr/bin/env node

/**
 * Doge Consulting — Version Bump Script
 *
 * Usage:
 *   node agents/bump-version.mjs              # Bump patch (1.3.0 → 1.3.1)
 *   node agents/bump-version.mjs minor        # Bump minor (1.3.0 → 1.4.0)
 *   node agents/bump-version.mjs major        # Bump major (1.3.0 → 2.0.0)
 *
 * Updates both package.json and VERSION file, then stages the changes.
 */

import { readFileSync, writeFileSync } from "fs";
import { execSync } from "child_process";

const type = process.argv[2] || "patch"; // patch, minor, major

// Read current version from package.json
const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
const [major, minor, patch] = pkg.version.split(".").map(Number);

let newVersion;
switch (type) {
  case "major": newVersion = `${major + 1}.0.0`; break;
  case "minor": newVersion = `${major}.${minor + 1}.0`; break;
  default:      newVersion = `${major}.${minor}.${patch + 1}`; break;
}

// Update package.json
pkg.version = newVersion;
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n", "utf-8");

// Update VERSION file
writeFileSync("VERSION", newVersion + "\n", "utf-8");

// Stage the changes
try {
  execSync("git add package.json VERSION", { stdio: "inherit" });
} catch { /* not in a git repo or git not available */ }

console.log(`✅ Version bumped: ${major}.${minor}.${patch} → ${newVersion}`);
console.log(`   package.json: ${newVersion}`);
console.log(`   VERSION: ${newVersion}`);
