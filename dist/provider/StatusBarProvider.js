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
exports.StatusBarProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs/promises"));
const SizeService_1 = require("../services/SizeService");
class StatusBarProvider {
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.name = "File Size";
    }
    activate(ctx) {
        ctx.subscriptions.push(this.statusBarItem);
        ctx.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
            this.updateStatusBar();
        }));
        ctx.subscriptions.push(vscode.workspace.onDidSaveTextDocument(() => {
            this.updateStatusBar();
        }));
        this.updateStatusBar();
    }
    async updateStatusBar() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            this.statusBarItem.hide();
            return;
        }
        const uri = editor.document.uri;
        if (uri.scheme !== "file") {
            this.statusBarItem.hide();
            return;
        }
        try {
            const stat = await fs.lstat(uri.fsPath);
            const size = stat.isDirectory()
                ? await SizeService_1.SizeService.folderSize(uri.fsPath)
                : stat.size;
            const formatted = this.formatBytes(size);
            this.statusBarItem.text = `$(file) ${formatted}`;
            this.statusBarItem.tooltip = `File size: ${formatted}`;
            this.statusBarItem.show();
        }
        catch {
            this.statusBarItem.hide();
        }
    }
    formatBytes(bytes) {
        if (bytes === 0)
            return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i];
    }
}
exports.StatusBarProvider = StatusBarProvider;
