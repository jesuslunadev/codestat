#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * List of file extensions considered as code files
 */
const CODE_FILE_EXTENSIONS = new Set([
  // Web & Programming Languages
  'js', 'ts', 'jsx', 'tsx', 'py', 'java', 'rb', 'php', 'go', 'rs', 'c', 'cpp', 'cs', 'swift', 'kt', 'kts',
  'html', 'css', 'scss', 'sass', 'less', 'vue', 'svelte', 'dart', 'r', 'pl', 'lua', 'scala',
  'erl', 'ex', 'exs', 'hs', 'ml', 'mli', 'nim', 'elm', 'clj', 'cljs', 'coffee',

  // Config & Data Files
  'json', 'yml', 'yaml', 'xml', 'toml', 'ini', 'conf', 'config', 'properties',
  'plist', 'env', 'lock', 'csv', 'tsv', 'ndjson', 'avro', 'parquet', 'orc',

  // Shell Scripts
  'sh', 'bash', 'zsh', 'fish', 'bat', 'cmd', 'ps1',

  // Documentation
  'md', 'markdown', 'txt', 'rst', 'asciidoc', 'adoc', 'org', 'creole',

  // Other Development Files
  'sql', 'prisma', 'graphql', 'gql', 'hbs', 'handlebars', 'ejs', 'pug', 'jade',
  'mustache', 'jinja', 'jinja2', 'njk', 'liquid', 'twig',

  // Test Files
  'spec.js', 'test.js', 'spec.ts', 'test.ts', 'story.js', 'story.ts',

  // Container & Deployment Files
  'dockerfile', 'dockerignore', 'compose.yml', 'compose.yaml', 'k8s.yml', 'k8s.yaml',

  // Version Control Files
  'gitignore', 'gitattributes', 'editorconfig',

  // CI/CD Files
  'travis.yml', 'circleci.yml', 'github.yml', 'gitlab-ci.yml', 'jenkinsfile', 'pipeline',

  // Package Manager Files
  'package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'composer.json',

  // IDE & Workspace Files
  'workspace', 'workspace.json', 'code-workspace', 'settings.json',

  // Binary or Compiled Files (for reference)
  'wasm', 'so', 'dll', 'exe', 'bin'
]);


/**
 * Analyzes the specified folder, iterating through its code files and subdirectories, to gather
 * statistics such as total number of files, total lines of code, total size, and the distribution
 * of file extensions.
 *
 * @param {string} folderPath - The path to the folder to analyze.
 * @return {Promise<Object>} A promise that resolves to an object containing statistics.
 */
async function analyzeFolder(folderPath) {
  let totalLines = 0;
  let totalFiles = 0;
  let totalSize = 0;
  const fileLines = [];
  const extensionsCount = {};

  async function analyzeDir(directory) {
    const entries = await fs.promises.readdir(directory, {withFileTypes: true});

    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);

      // Skip node_modules and .git directories
      if (entry.isDirectory()) {
        const dirName = path.basename(fullPath);
        if (dirName !== 'node_modules' && dirName !== '.git') {
          await analyzeDir(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(fullPath).slice(1).toLowerCase();

        // Only process files with recognized code extensions
        if (CODE_FILE_EXTENSIONS.has(ext)) {
          totalFiles += 1;

          try {
            // Read file to count lines
            const fileContent = await fs.promises.readFile(fullPath, "utf8");
            const lines = fileContent.split("\n").length;
            totalLines += lines;
            fileLines.push({file: fullPath, lines});

            // Add file size
            const stats = await fs.promises.stat(fullPath);
            totalSize += stats.size;

            // Count extensions
            extensionsCount[ext] = (extensionsCount[ext] || 0) + 1;
          } catch (error) {
            console.warn(`Warning: Could not read file ${fullPath}`, error.message);
          }
        }
      }
    }
  }

  await analyzeDir(folderPath);

  // Sort files by lines of code
  const topFiles = fileLines.sort((a, b) => b.lines - a.lines).slice(0, 10);

  // Sort extensions by popularity
  const topExtensions = Object.entries(extensionsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return {totalLines, totalFiles, totalSize, topFiles, topExtensions};
}

/**
 * Converts a file size in bytes into a human-readable string format.
 *
 * @param {number} size - The size in bytes that needs to be converted.
 * @return {string} The human-readable string representing the size.
 */
function humanReadableSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

// Main
(async () => {
  const folderPath = process.argv[2];

  if (!folderPath) {
    console.error("Usage: codestat <directory>");
    process.exit(1);
  }

  try {
    const {totalLines, totalFiles, totalSize, topFiles, topExtensions} =
      await analyzeFolder(folderPath);

    console.log("\n");
    console.log("----------------------------");
    console.log("| Project Analysis Summary |");
    console.log("----------------------------");
    console.log(`* Total lines of code: ${totalLines}`);
    console.log(`* Total number of files: ${totalFiles}`);
    console.log(`* Total size of files: ${humanReadableSize(totalSize)}`);
    console.log("\n");
    console.log("[i] Top 10 files with most lines:");
    topFiles.forEach(({file, lines}) => {
      console.log(`  ${lines} lines - ${file}`);
    });
    console.log("\n");
    console.log("[i] Top 10 most popular file formats:");
    topExtensions.forEach(([ext, count]) => {
      console.log(`  ${count} files - .${ext}`);
    });
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
})();
