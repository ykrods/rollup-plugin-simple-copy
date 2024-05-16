/**
 *  rollup-plugin-simple-copy
 *
 *  * TODO: Add static files to watch targets
 */
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/**
 * @typedef { import("rollup").Plugin } Plugin
 *
 * @typedef { import("./types").CopyTarget } CopyTarget
 * @typedef { import("./types").RollupPluginSimpleCopyOptions } RollupPluginSimpleCopyOptions
 */

// sankou https://gist.github.com/lovasoa/8691344#gistcomment-3299089
/**
 * @param {string} dir
 * @returns {AsyncGenerator<string>}
 */
async function* walk(dir) {
  for await (const d of await fs.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* await walk(entry);
    else if (d.isFile()) yield entry;
  }
}

/**
 * @param {string} srcBase
 * @param {string} destBase
 * @param {CopyTarget[]} targets
 */
export async function* collect(srcBase, destBase, targets) {
  for (let target of targets) {
    const tSrc = path.resolve(srcBase, target.src);
    const stat = await fs.stat(tSrc);
    if (!stat.isDirectory()) {
      throw new Error(`${target.src} is not a directory`);
    }

    for await (const src of await walk(tSrc)) {
      if (target.filter && !target.filter(src)) {
        continue;
      }
      const rPath = path.relative(tSrc, src);
      yield { src, dest: path.resolve(destBase, target.dest, rPath) }
    }
  }
}

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
