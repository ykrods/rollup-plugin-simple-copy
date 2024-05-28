/**
 * vite-plugin-simple-copy
 *
 * This plugin is based on [vite-plugin-static-copy](https://github.com/sapphi-red/vite-plugin-static-copy)
 */
import fs from "node:fs/promises";
import path from "node:path";

import { buildSimpleCopyMiddleware, fixMiddlewaresOrder } from "./serve.js";
import { collect } from "./build.js";

/**
 * @typedef { import("vite").Plugin } Plugin
 * @typedef { import("vite").ResolvedConfig } ResolvedConfig
 *
 * @typedef { import("./types").VitePluginSimpleCopyOptions } VitePluginSimpleCopyOptions
 */

/**
 * @param {VitePluginSimpleCopyOptions} options
 * @returns {Plugin}
 */
export function servePlugin(options) {
  /** @type {ResolvedConfig?} */
  let config = null

  return {
    name: "vite-plugin-simple-copy:serve",
    apply: "serve",
    configResolved(cnf) {
      config = cnf
    },
    configureServer({ middlewares }) {
      return () => {
        middlewares.use(buildSimpleCopyMiddleware(options))
        fixMiddlewaresOrder(middlewares)
      }
    }
  }
}

/**
 * @param {VitePluginSimpleCopyOptions} options
 * @returns {Plugin}
 */
export function buildPlugin(options) {
  /** @type {ResolvedConfig?} */
  let config = null
  let output = false

  return {
    name: "vite-plugin-simple-copy:build",
    apply: "build",
    configResolved(cnf) {
      config = cnf
    },
    buildEnd() {
      output = false
    },
    async writeBundle() {
      if (output) return
      output = true

      if (!config) return

      for await (const { src, dest } of collect(config.root, config.build.outDir, options.targets)) {
        // console.log(`src: ${src}, dest: ${dest}`);
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(src, dest);
      }
    }
  }
}

/**
 * @param {VitePluginSimpleCopyOptions} options
 * @return {Plugin[]}
 */
export default function copy(options) {
  return [servePlugin(options), buildPlugin(options)]
}
