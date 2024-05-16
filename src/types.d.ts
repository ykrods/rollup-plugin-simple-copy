export interface CopyTarget {
  src: string
  dest: string
  filter?: (src: string) => boolean
}

export interface RollupPluginSimpleCopyOptions {
    targets: CopyTarget[]
    rootDir: string
}
