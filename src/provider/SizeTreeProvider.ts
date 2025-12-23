import * as vscode from "vscode"
import { SizeService } from "../services/SizeService"
import { ConfigService } from "../services/ConfigService"
import { formatSize } from "../utils/format"
import * as path from "path"
import * as fs from "fs/promises"

class SizeItem extends vscode.TreeItem {
  constructor(
    label: string,
    uri: vscode.Uri,
    size: number,
    collapsible: vscode.TreeItemCollapsibleState,
    isDirectory: boolean
  ) {
    super(label, collapsible)
    this.resourceUri = uri
    this.description = formatSize(size)
    this.tooltip = `${label}\nSize: ${formatSize(size)}`

    if (isDirectory) {
      this.iconPath = new vscode.ThemeIcon(
        "folder",
        this.getSizeColor(size)
      )
    } else {
      this.iconPath = new vscode.ThemeIcon(
        "file",
        this.getSizeColor(size)
      )
    }

    this.contextValue = isDirectory ? "folder" : "file"
  }

  private getSizeColor(bytes: number): vscode.ThemeColor {
    const mb = bytes / (1024 * 1024)

    if (mb >= 100) return new vscode.ThemeColor("errorForeground")
    if (mb >= 10) return new vscode.ThemeColor("editorWarning.foreground")
    if (mb >= 1) return new vscode.ThemeColor("charts.yellow")
    return new vscode.ThemeColor("foreground")
  }
}

export class SizeTreeProvider
  implements vscode.TreeDataProvider<SizeItem>
{
  private emitter = new vscode.EventEmitter<void>()
  readonly onDidChangeTreeData = this.emitter.event

  refresh() {
    this.emitter.fire()
  }

  async getChildren(item?: SizeItem): Promise<SizeItem[]> {
    const root =
      item?.resourceUri?.fsPath ??
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath

    if (!root) return []

    const result: SizeItem[] = []

    for (const name of await fs.readdir(root)) {
      if (name === ".git") continue
      if (name === "node_modules" && !ConfigService.showNodeModules()) continue

      const full = path.join(root, name)
      try {
        const stat = await fs.lstat(full)
        const isDirectory = stat.isDirectory()
        const size = isDirectory
          ? await SizeService.folderSize(full)
          : stat.size

        result.push(
          new SizeItem(
            name,
            vscode.Uri.file(full),
            size,
            isDirectory
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None,
            isDirectory
          )
        )
      } catch {}
    }

    if (ConfigService.sortBySize()) {
      result.sort(
        (a, b) =>
          parseFloat(b.description as string) -
          parseFloat(a.description as string)
      )
    }

    return result
  }

  getTreeItem(item: SizeItem) {
    return item
  }

  registerWatchers(ctx: vscode.ExtensionContext) {
    const watcher = vscode.workspace.createFileSystemWatcher("**/*")
    const debounce = () => {
      SizeService.clearCache()
      this.refresh()
    }

    watcher.onDidChange(debounce)
    watcher.onDidCreate(debounce)
    watcher.onDidDelete(debounce)

    ctx.subscriptions.push(watcher)
  }
}
