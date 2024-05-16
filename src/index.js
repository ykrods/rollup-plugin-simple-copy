/**
 *  rollup-plugin-simple-copy
 *
 *  * TODO: Add static files to watch targets
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { collect } from "./build.js";

/**
 * @typedef { import("rollup").Plugin } Plugin
 *
 * @typedef { import("./types").RollupPluginSimpleCopyOptions } RollupPluginSimpleCopyOptions
 */

/**
 * @param {RollupPluginSimpleCopyOptions} options
 * @returns {Plugin}
 */
export function copy(options) {
  const { targets } = options;

  return {
    name: 'copy',
    async generateBundle() {
      const rootDir = options.rootDir || process.cwd()

      for await (const { src, dest } of collect(rootDir, rootDir, targets)) {
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(src, dest);
      }
    }
  };
}
