import type { PluginOption } from "vite";
import { VitePluginSimpleCopyOptions } from "./types.d.ts";

declare module "rollup-plugin-simple-copy/vite" {
  export default (options: VitePluginSimpleCopyOptions) => PluginOption
}
