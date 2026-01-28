import * as vscode from "vscode"
import * as fs from "fs/promises"
import { SizeService } from "../services/SizeService"
import { ConfigService } from "../services/ConfigService"
import { FolderStats } from "../types"

export class SizeDecorationProvider implements vscode.FileDecorationProvider {
  private emitter = new vscode.EventEmitter<vscode.Uri | vscode.Uri[]>()
  readonly onDidChangeFileDecorations = this.emitter.event

  refresh(uri?: vscode.Uri) {
    if (uri) {
      this.emitter.fire(uri)
    } else {
      this.emitter.fire([])
    }
  }

  async provideFileDecoration(
    uri: vscode.Uri
  ): Promise<vscode.FileDecoration | undefined> {
    if (uri.scheme !== "file") return undefined

    try {
      const stat = await fs.lstat(uri.fsPath)

      let size: number
      let fileCount: number | undefined
      let folderCount: number | undefined

      if (stat.isDirectory()) {
        const stats = await Promise.race([
          SizeService.folderStats(uri.fsPath, false),
          new Promise<FolderStats>((resolve) => setTimeout(() => resolve({ size: 0, fileCount: 0, folderCount: 0 }), 3000))
        ])
        size = stats.size
        fileCount = stats.fileCount
        folderCount = stats.folderCount
      } else {
        size = stat.size
      }

      if (size === 0 && stat.isDirectory()) {
        return undefined
      }

      const badge = this.getSizeBadge(size)
      const color = this.getSizeColor(size)
      const sizeFormatted = this.formatBytes(size)

      let tooltip = `Size: ${sizeFormatted}`
      if (stat.isDirectory() && fileCount !== undefined && folderCount !== undefined) {
        const totalItems = fileCount + folderCount
        tooltip = `Size: ${sizeFormatted}\nFiles: ${fileCount}\nFolders: ${folderCount}\nTotal: ${totalItems} items`
      }

      return {
        badge: badge,
        color: new vscode.ThemeColor(color),
        tooltip,
        propagate: false
      }
    } catch (err) {
      console.error(`[SizeDecoration] Error for ${uri.fsPath}:`, err)
      return undefined
    }
  }

  private getSizeBadge(bytes: number): string {
    const kb = bytes / 1024
    const mb = kb / 1024
    const gb = mb / 1024

    if (gb >= 1) return "G"
    if (mb >= 100) return "XL"
    if (mb >= 10) return "L"
    if (mb >= 1) return "M"
    if (kb >= 100) return "K"
    return "S"
  }

  private getSizeColor(bytes: number): string {
    const mb = bytes / (1024 * 1024)

    if (mb >= 100) return "errorForeground"
    if (mb >= 10) return "editorWarning.foreground"
    if (mb >= 1) return "charts.yellow"
    return "descriptionForeground"
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]
  }
}
