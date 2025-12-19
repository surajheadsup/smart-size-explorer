import * as vscode from "vscode"

export class ConfigService {
  static get() {
    return vscode.workspace.getConfiguration("smartSizeExplorer")
  }

  static showNodeModules(): boolean {
    return this.get().get("showNodeModules", false)
  }

  static sortBySize(): boolean {
    return this.get().get("sortBySize", true)
  }

  static cacheTTL(): number {
    return this.get().get("cacheTTL", 5000)
  }
}
