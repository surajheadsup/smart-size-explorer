import * as vscode from "vscode"
import { SizeTreeProvider } from "./provider/SizeTreeProvider"

export function activate(ctx: vscode.ExtensionContext) {
  const provider = new SizeTreeProvider()

  ctx.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      "smartSizeExplorer",
      provider
    )
  )

  provider.registerWatchers(ctx)
}

export function deactivate() {}
