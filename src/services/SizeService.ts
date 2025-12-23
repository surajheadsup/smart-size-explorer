import { FileSystemService } from "./FileSystemService"
import { ConfigService } from "./ConfigService"

type CacheEntry = { size: number; expires: number }
const cache = new Map<string, CacheEntry>()

export class SizeService {
  static async folderSize(dir: string, applyFilters: boolean = true): Promise<number> {
    const cacheKey = `${dir}:${applyFilters}`
    const now = Date.now()
    const ttl = ConfigService.cacheTTL()
    const cached = cache.get(cacheKey)

    if (cached && cached.expires > now) return cached.size

    let total = 0
    for (const file of await FileSystemService.readDir(dir)) {
      if (applyFilters) {
        if (file === ".git") continue
        if (file === "node_modules" && !ConfigService.showNodeModules()) continue
      }

      const full = FileSystemService.join(dir, file)
      try {
        const stat = await FileSystemService.stat(full)
        total += stat.isDirectory()
          ? await this.folderSize(full, applyFilters)
          : stat.size
      } catch {}
    }

    cache.set(cacheKey, { size: total, expires: now + ttl })
    return total
  }

  static clearCache() {
    cache.clear()
  }
}
