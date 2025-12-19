import * as fs from "fs/promises"
import * as path from "path"

export class FileSystemService {
  static async readDir(dir: string): Promise<string[]> {
    return fs.readdir(dir)
  }

  static async stat(p: string) {
    return fs.lstat(p)
  }

  static join(...args: string[]) {
    return path.join(...args)
  }
}
