"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizeService = void 0;
const FileSystemService_1 = require("./FileSystemService");
const ConfigService_1 = require("./ConfigService");
const cache = new Map();
class SizeService {
    static async folderSize(dir, applyFilters = true) {
        const cacheKey = `${dir}:${applyFilters}`;
        const now = Date.now();
        const ttl = ConfigService_1.ConfigService.cacheTTL();
        const cached = cache.get(cacheKey);
        if (cached && cached.expires > now)
            return cached.size;
        let total = 0;
        for (const file of await FileSystemService_1.FileSystemService.readDir(dir)) {
            if (applyFilters) {
                if (file === ".git")
                    continue;
                if (file === "node_modules" && !ConfigService_1.ConfigService.showNodeModules())
                    continue;
            }
            const full = FileSystemService_1.FileSystemService.join(dir, file);
            try {
                const stat = await FileSystemService_1.FileSystemService.stat(full);
                total += stat.isDirectory()
                    ? await this.folderSize(full, applyFilters)
                    : stat.size;
            }
            catch { }
        }
        cache.set(cacheKey, { size: total, expires: now + ttl });
        return total;
    }
    static clearCache() {
        cache.clear();
    }
}
exports.SizeService = SizeService;
