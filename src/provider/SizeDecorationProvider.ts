import * as vscode from "vscode"
import * as fs from "fs/promises"
import { SizeService } from "../services/SizeService"
import { ConfigService } from "../services/ConfigService"

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
      if (stat.isDirectory()) {
        size = await Promise.race([
          SizeService.folderSize(uri.fsPath, false),
          new Promise<number>((resolve) => setTimeout(() => resolve(0), 3000))
        ])
      } else {
        size = stat.size
      }

      if (size === 0 && stat.isDirectory()) {
        return undefined
      }

      const badge = this.getSizeBadge(size)
      const color = this.getSizeColor(size)
      const tooltip = this.formatBytes(size)

      return {
        badge: badge,
        color: new vscode.ThemeColor(color),
        tooltip: `Size: ${tooltip}`,
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
