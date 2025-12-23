# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

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
