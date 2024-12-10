# codestat

A command-line tool to analyze code repositories and generate statistics about lines of code, file sizes, and file types.

## Features

- Count total lines of code across all files
- Calculate total number of files and their combined size
- List top 10 largest files by line count
- Show most common file extensions
- Recursive directory analysis
- Human-readable file size output

## Installation

```bash
npm install -g codestat
```

## Usage

```bash
codestat <directory_path>
```

### Example

```bash
codestat ./my-project
```

### Output example:

```bash
----------------------------
| Project Analysis Summary |
----------------------------
* Total lines of code: 1106
* Total number of files: 43
* Total size of files: 35.76 KB

[i] Top 10 files with most lines:
  175 lines - ./my-project/src/test-file.js
  75 lines - ./my-project/src/test-file-2.js
  
[i] Top 10 most popular file formats:
  13 files - .js
```

## Requirements
- node.js >= 14.0.0
- npm >= 6.0.0

## Licence
MIT

## Author
Jesus Luna
