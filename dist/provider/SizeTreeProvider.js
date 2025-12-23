"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.SizeTreeProvider = void 0;
const vscode = __importStar(require("vscode"));
const SizeService_1 = require("../services/SizeService");
const ConfigService_1 = require("../services/ConfigService");
const format_1 = require("../utils/format");
const path = __importStar(require("path"));
const fs = __importStar(require("fs/promises"));
class SizeItem extends vscode.TreeItem {
    constructor(label, uri, size, collapsible, isDirectory) {
        super(label, collapsible);
        this.resourceUri = uri;
        this.description = (0, format_1.formatSize)(size);
        this.tooltip = `${label}\nSize: ${(0, format_1.formatSize)(size)}`;
        if (isDirectory) {
            this.iconPath = new vscode.ThemeIcon("folder", this.getSizeColor(size));
        }
        else {
            this.iconPath = new vscode.ThemeIcon("file", this.getSizeColor(size));
        }
        this.contextValue = isDirectory ? "folder" : "file";
    }
    getSizeColor(bytes) {
        const mb = bytes / (1024 * 1024);
        if (mb >= 100)
            return new vscode.ThemeColor("errorForeground");
        if (mb >= 10)
            return new vscode.ThemeColor("editorWarning.foreground");
        if (mb >= 1)
            return new vscode.ThemeColor("charts.yellow");
        return new vscode.ThemeColor("foreground");
    }
}
class SizeTreeProvider {
    constructor() {
        this.emitter = new vscode.EventEmitter();
        this.onDidChangeTreeData = this.emitter.event;
    }
    refresh() {
        this.emitter.fire();
    }
    async getChildren(item) {
        const root = item?.resourceUri?.fsPath ??
            vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!root)
            return [];
        const result = [];
        for (const name of await fs.readdir(root)) {
            if (name === ".git")
                continue;
            if (name === "node_modules" && !ConfigService_1.ConfigService.showNodeModules())
                continue;
            const full = path.join(root, name);
            try {
                const stat = await fs.lstat(full);
                const isDirectory = stat.isDirectory();
                const size = isDirectory
                    ? await SizeService_1.SizeService.folderSize(full)
                    : stat.size;
                result.push(new SizeItem(name, vscode.Uri.file(full), size, isDirectory
                    ? vscode.TreeItemCollapsibleState.Collapsed
                    : vscode.TreeItemCollapsibleState.None, isDirectory));
            }
            catch { }
        }
        if (ConfigService_1.ConfigService.sortBySize()) {
            result.sort((a, b) => parseFloat(b.description) -
                parseFloat(a.description));
        }
        return result;
    }
    getTreeItem(item) {
        return item;
    }
    registerWatchers(ctx) {
        const watcher = vscode.workspace.createFileSystemWatcher("**/*");
        const debounce = () => {
            SizeService_1.SizeService.clearCache();
            this.refresh();
        };
        watcher.onDidChange(debounce);
        watcher.onDidCreate(debounce);
        watcher.onDidDelete(debounce);
        ctx.subscriptions.push(watcher);
    }
}
exports.SizeTreeProvider = SizeTreeProvider;
