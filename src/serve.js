// based on https://github.com/vitejs/vite/blob/7edabb46de3ce63e078e0cda7cd3ed9e5cdd0f2a/packages/vite/src/node/server/middlewares/static.ts#L19-L46
// MIT License
// Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors
// https://github.com/vitejs/vite/blob/7edabb46de3ce63e078e0cda7cd3ed9e5cdd0f2a/LICENSE

// based on https://github.com/lukeed/sirv/blob/886cc962a345780cd78f8910cdcf218db2a8d955/packages/sirv/index.js
// MIT License
// Copyright (c) Luke Edwards <luke.edwards05@gmail.com> (https://lukeed.com)
// https://github.com/lukeed/sirv/blob/886cc962a345780cd78f8910cdcf218db2a8d955/license

// based on https://github.com/sapphi-red/vite-plugin-static-copy/blob/520653429a0aa2122feee9edbacc2195fd2624e4/src/middleware.ts#L265-L323
// MIT License
// Copyright (c) 2021 sapphi-red
// https://github.com/sapphi-red/vite-plugin-static-copy/blob/520653429a0aa2122feee9edbacc2195fd2624e4/LICENSE

import fs from "node:fs/promises";
import path from "node:path";

/**
 * @typedef {import("vite").Connect.Server} Connect.Server
 * @typedef {import("vite").Connect.NextHandleFunction} Connect.NextHandleFunction
 * @typedef {import("./types").VitePluginSimpleCopyOptions} VitePluginSimpleCopyOptions
 */

/**
 * @param {Connect.Server} middlewares
 */
export function fixMiddlewaresOrder(middlewares) {
  /** @type {(...names: string[]) => Number} */
  const findMiddlewareIndex = (...names) => {
    return middlewares.stack.findIndex(
      m => typeof m.handle === "function" && names.includes(m.handle.name)
    );
  }
  const from = findMiddlewareIndex("simpleCopyMiddleware")

  // pop middleware
  const middleware = middlewares.stack.splice(from, 1)[0];

  let to = findMiddlewareIndex("viteServePublicMiddleware", "viteTransformMiddleware")
  // insert middleware
  middlewares.stack.splice(to, 0, middleware);
}

/**
 *
 * @param {VitePluginSimpleCopyOptions} options
 * @returns {Connect.NextHandleFunction}
 */
export function buildSimpleCopyMiddleware(options) {
  /** @type {(reqUrl: string) => string} */
  const getPathname = (reqUrl) => {
    // XXX: host and port are not referended. so use fixed values.
    const url = new URL(`http://localhost:5173${reqUrl}`);
    return decodeURI(url.pathname)
  }

  /** @type {(pathname: string) => string?} */
  const getContentType = (pathname) => {
    return options.extMap[path.extname(pathname)] || null;
  };

  return async function simpleCopyMiddleware(req, res, next) {
    if (!req.url) { next(); return; }

    const pathname = getPathname(req.url);

    for (const { src, dest, filter } of options.targets) {
      if (pathname.startsWith(`/${dest}/`)) {
        const relPath = path.relative(`/${dest}`, pathname);
        const srcPath = path.resolve(src, relPath);

        if (filter && typeof filter === 'function' && !filter(srcPath)) {
          continue;
        }

        const contentType = getContentType(pathname);
        if (!contentType) {
          continue;
        }

        try {
          const content = await fs.readFile(srcPath);

          res.writeHead(200, {'Content-Type': contentType });
          res.end(content);
          return;
        } catch (e) {
          console.error(e);
        }
      }
    }
    next()
  }
}
