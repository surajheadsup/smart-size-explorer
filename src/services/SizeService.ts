import { FileSystemService } from "./FileSystemService"
import { ConfigService } from "./ConfigService"
import { FolderStats } from "../types"

type CacheEntry = { stats: FolderStats; expires: number }
const cache = new Map<string, CacheEntry>()

export class SizeService {
  static async folderStats(dir: string, applyFilters: boolean = true): Promise<FolderStats> {
    const cacheKey = `${dir}:${applyFilters}`
    const now = Date.now()
    const ttl = ConfigService.cacheTTL()
    const cached = cache.get(cacheKey)

    if (cached && cached.expires > now) return cached.stats

    let totalSize = 0
    let fileCount = 0
    let folderCount = 0

    try {
      for (const file of await FileSystemService.readDir(dir)) {
        if (applyFilters) {
          if (file === ".git") continue
          if (file === "node_modules" && !ConfigService.showNodeModules()) continue
        }

        const full = FileSystemService.join(dir, file)
        try {
          const stat = await FileSystemService.stat(full)
          if (stat.isDirectory()) {
            folderCount++
            const subStats = await this.folderStats(full, applyFilters)
            totalSize += subStats.size
            fileCount += subStats.fileCount
            folderCount += subStats.folderCount
          } else {
            fileCount++
            totalSize += stat.size
          }
        } catch {}
      }
    } catch {}

    const stats: FolderStats = {
      size: totalSize,
      fileCount,
      folderCount
    }

    cache.set(cacheKey, { stats, expires: now + ttl })
    return stats
  }

  static async folderSize(dir: string, applyFilters: boolean = true): Promise<number> {
    const stats = await this.folderStats(dir, applyFilters)
    return stats.size
  }

  static clearCache() {
    cache.clear()
  }
}
