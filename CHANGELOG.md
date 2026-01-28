# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added
- **File and Folder Counting**: Folders now display the total number of files and subfolders
  - Tree view shows: `folder-name • 15 items (10 files, 5 folders) - 1.2 MB`
  - Status bar displays item counts for active folders: `📁 1.2 MB • 15 items`
  - Enhanced tooltips with detailed breakdowns (size, file count, folder count, total items)
  - File decoration tooltips now include counts for better insights

### Changed
- Updated `SizeService` to calculate and cache file/folder counts alongside sizes
- Enhanced `SizeTreeProvider` to display comprehensive folder statistics
- Improved `StatusBarProvider` to show folder item counts
- Extended `SizeDecorationProvider` tooltips with detailed folder information

### Performance
- File and folder counts are cached with the same TTL as size calculations
- Single recursive traversal calculates both size and counts efficiently
- No additional performance overhead on existing operations

---

## [1.3.0] - 2025-12-19

### Added
- Custom Explorer view to display file and folder sizes
- Recursive folder size calculation
- Live updates on file system changes
- Size-based sorting (largest first)
- Configurable caching with TTL
- Toggle to include/exclude `node_modules`

### Performance
- Fully async, non-blocking file system operations
- Debounced file watcher to prevent refresh storms
- In-memory cache with automatic invalidation

### Stability
- Safe handling of permission errors
- Graceful handling of broken symlinks
- Memory cleanup on extension deactivation

### Configuration
- `smartSizeExplorer.showNodeModules`
- `smartSizeExplorer.sortBySize`
- `smartSizeExplorer.cacheTTL`

---

## [1.0.0] - 2025-12-10

### Added
- Initial prototype implementation
