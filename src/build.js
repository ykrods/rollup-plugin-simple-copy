import fs from "node:fs/promises";
import path from "node:path";

/**
 * @typedef { import("./types").CopyTarget } CopyTarget
 * @typedef { import("./types").TargetEntry } TargetEntry
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
 * @param {string} srcBase - base path of target.src
 * @param {string} destBase - base path of target.dest
 * @param {CopyTarget[]} targets
 * @returns {AsyncGenerator<TargetEntry>}
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
