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
    collapsible: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsible)
    this.resourceUri = uri
    this.description = formatSize(size)
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
        const size = stat.isDirectory()
          ? await SizeService.folderSize(full)
          : stat.size

        result.push(
          new SizeItem(
            name,
            vscode.Uri.file(full),
            size,
            stat.isDirectory()
              ? vscode.TreeItemCollapsibleState.Collapsed
              : vscode.TreeItemCollapsibleState.None
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
