Smart Size Explorer adds a dedicated Explorer view that shows the size of files and folders in your workspace.

It is designed for real-world projects, including large repositories and monorepos, with a focus on performance, stability, and usability.

---

## ✨ Features

- 📁 View file and folder sizes in a custom Explorer panel
- ⚡ Fully async and non-blocking (no UI freezes)
- 🔄 Live updates on file system changes
- 📊 Sort items by size (largest first)
- 🧠 Smart caching with configurable TTL
- 🚫 Optional inclusion of `node_modules`
- 🛡️ Safe handling of permission errors and broken symlinks

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
