Smart Size Explorer adds a dedicated Explorer view that shows the size of files and folders in your workspace, along with detailed file and folder counts.

It is designed for real-world projects, including large repositories and monorepos, with a focus on performance, stability, and usability.

---

## ✨ Features

- 📁 View file and folder sizes in a custom Explorer panel
- 🔢 **NEW: File and folder counting** - See the exact number of files and subfolders in each directory
  - Tree view displays: `folder-name • 15 items (10 files, 5 folders) - 1.2 MB`
  - Status bar shows counts for active folders
  - Enhanced tooltips with complete breakdowns
- ⚡ Fully async and non-blocking (no UI freezes)
- 🔄 Live updates on file system changes
- 📊 Sort items by size (largest first)
- 🧠 Smart caching with configurable TTL (caches both sizes and counts)
- 🚫 Optional inclusion of `node_modules`
- 🛡️ Safe handling of permission errors and broken symlinks

---

## 📊 What's New - File and Folder Counting

Smart Size Explorer now shows you exactly how many files and folders are inside each directory:

**Tree View Display:**
```
📁 src • 127 items (95 files, 32 folders) - 2.4 MB
📁 node_modules • 8,542 items (7,891 files, 651 folders) - 156.3 MB
📄 README.md - 4.2 KB
```

**Status Bar:**
- When you open a folder: `📁 2.4 MB • 127 items`
- When you open a file: `📄 4.2 KB`

**Enhanced Tooltips:**
Hover over any folder to see:
- Total size
- Number of files
- Number of folders
- Total items count

**Performance:**
- Counts are calculated during the same recursive traversal as sizes
- Results are cached together (no extra overhead)
- Updates automatically when files are added/removed

---

## ⚙️ Configuration

Open **Settings → Smart Size Explorer**:

- `smartSizeExplorer.showNodeModules`  
  Show or hide the `node_modules` folder size (disabled by default)

- `smartSizeExplorer.sortBySize`  
  Sort files and folders by size (largest first)

- `smartSizeExplorer.cacheTTL`  
  Cache duration (in milliseconds) for folder size calculations

---

## 🚀 Why Smart Size Explorer?

Most file explorers don’t show folder sizes or struggle with large projects.  
Smart Size Explorer is built with production-grade performance and clean architecture, making it reliable even for very large codebases.

---

## 📌 Notes

- The VS Code API does not allow modifying the default Explorer tree.
- This extension uses a dedicated Explorer view, which is the officially supported approach.

---

## 📄 License

MIT
