import * as vscode from "vscode"
import { SizeTreeProvider } from "./provider/SizeTreeProvider"
import { SizeDecorationProvider } from "./provider/SizeDecorationProvider"
import { StatusBarProvider } from "./provider/StatusBarProvider"

export function activate(ctx: vscode.ExtensionContext) {
  const treeProvider = new SizeTreeProvider()
  const decorationProvider = new SizeDecorationProvider()
  const statusBarProvider = new StatusBarProvider()

  ctx.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      "smartSizeExplorer",
      treeProvider
    )
  )

  ctx.subscriptions.push(
    vscode.window.registerFileDecorationProvider(decorationProvider)
  )

  statusBarProvider.activate(ctx)

  treeProvider.registerWatchers(ctx)

  ctx.subscriptions.push(
    vscode.workspace.createFileSystemWatcher("**/*").onDidChange(() => {
      decorationProvider.refresh()
    })
  )

  ctx.subscriptions.push(
    vscode.workspace.createFileSystemWatcher("**/*").onDidCreate(() => {
      decorationProvider.refresh()
    })
  )

  ctx.subscriptions.push(
    vscode.workspace.createFileSystemWatcher("**/*").onDidDelete(() => {
      decorationProvider.refresh()
    })
  )
}

export function deactivate() {}
