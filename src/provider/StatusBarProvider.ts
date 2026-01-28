import * as vscode from "vscode"
import * as fs from "fs/promises"
import { SizeService } from "../services/SizeService"

export class StatusBarProvider {
  private statusBarItem: vscode.StatusBarItem

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )
    this.statusBarItem.name = "File Size"
  }

  activate(ctx: vscode.ExtensionContext) {
    ctx.subscriptions.push(this.statusBarItem)

    ctx.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(() => {
        this.updateStatusBar()
      })
    )

    ctx.subscriptions.push(
      vscode.workspace.onDidSaveTextDocument(() => {
        this.updateStatusBar()
      })
    )

    this.updateStatusBar()
  }

  private async updateStatusBar() {
    const editor = vscode.window.activeTextEditor

    if (!editor) {
      this.statusBarItem.hide()
      return
    }

    const uri = editor.document.uri
    if (uri.scheme !== "file") {
      this.statusBarItem.hide()
      return
    }

    try {
      const stat = await fs.lstat(uri.fsPath)

      if (stat.isDirectory()) {
        const stats = await SizeService.folderStats(uri.fsPath)
        const formatted = this.formatBytes(stats.size)
        const totalItems = stats.fileCount + stats.folderCount
        this.statusBarItem.text = `$(folder) ${formatted} • ${totalItems} items`
        this.statusBarItem.tooltip = `Folder size: ${formatted}\nFiles: ${stats.fileCount}\nFolders: ${stats.folderCount}\nTotal: ${totalItems} items`
        this.statusBarItem.show()
      } else {
        const formatted = this.formatBytes(stat.size)
        this.statusBarItem.text = `$(file) ${formatted}`
        this.statusBarItem.tooltip = `File size: ${formatted}`
        this.statusBarItem.show()
      }
    } catch {
      this.statusBarItem.hide()
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]
  }
}
