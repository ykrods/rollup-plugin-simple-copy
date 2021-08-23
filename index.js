/**
 *  rollup-plugin-simple-copy
 *
 *  * TODO: Add static files to watch targets
 */
const fs = require("fs");
const path = require("path");


// sankou https://gist.github.com/lovasoa/8691344#gistcomment-3299089
async function* walk(dir) {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* await walk(entry);
        else if (d.isFile()) yield entry;
    }
}

function copy(options = { targets: [] }) {
  const { targets } = options;

  return {
    name: 'copy',
    async generateBundle() {
      for (let target of targets) {
        for await (const src of await walk(target.src)) {
          const dest = path.join(target.dest, path.relative(target.src, src));
          await fs.promises.mkdir(path.dirname(dest), { recursive: true });
          await fs.promises.copyFile(src, dest);
        }
      }
    }
  };
}

module.exports = copy;
