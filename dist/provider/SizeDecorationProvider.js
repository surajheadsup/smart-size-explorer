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
exports.SizeDecorationProvider = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs/promises"));
const SizeService_1 = require("../services/SizeService");
class SizeDecorationProvider {
    constructor() {
        this.emitter = new vscode.EventEmitter();
        this.onDidChangeFileDecorations = this.emitter.event;
    }
    refresh(uri) {
        if (uri) {
            this.emitter.fire(uri);
        }
        else {
            this.emitter.fire([]);
        }
    }
    async provideFileDecoration(uri) {
        if (uri.scheme !== "file")
            return undefined;
        try {
            const stat = await fs.lstat(uri.fsPath);
            let size;
            if (stat.isDirectory()) {
                size = await Promise.race([
                    SizeService_1.SizeService.folderSize(uri.fsPath, false),
                    new Promise((resolve) => setTimeout(() => resolve(0), 3000))
                ]);
            }
            else {
                size = stat.size;
            }
            if (size === 0 && stat.isDirectory()) {
                return undefined;
            }
            const badge = this.getSizeBadge(size);
            const color = this.getSizeColor(size);
            const tooltip = this.formatBytes(size);
            return {
                badge: badge,
                color: new vscode.ThemeColor(color),
                tooltip: `Size: ${tooltip}`,
                propagate: false
            };
        }
        catch (err) {
            console.error(`[SizeDecoration] Error for ${uri.fsPath}:`, err);
            return undefined;
        }
    }
    getSizeBadge(bytes) {
        const kb = bytes / 1024;
        const mb = kb / 1024;
        const gb = mb / 1024;
        if (gb >= 1)
            return "G";
        if (mb >= 100)
            return "XL";
        if (mb >= 10)
            return "L";
        if (mb >= 1)
            return "M";
        if (kb >= 100)
            return "K";
        return "S";
    }
    getSizeColor(bytes) {
        const mb = bytes / (1024 * 1024);
        if (mb >= 100)
            return "errorForeground";
        if (mb >= 10)
            return "editorWarning.foreground";
        if (mb >= 1)
            return "charts.yellow";
        return "descriptionForeground";
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
exports.SizeDecorationProvider = SizeDecorationProvider;
