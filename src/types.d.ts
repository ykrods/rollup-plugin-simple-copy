export interface CopyTarget {
  /** rel path to the copy target directory */
  src: string
  /** rel path to the parent directory of copy destination */
  dest: string
  filter?: (src: string) => boolean
}

export interface TargetEntry {
  /** abs path of collected file */
  src: string
  /** abs path of copy destination */
  dest: string
}

export interface RollupPluginSimpleCopyOptions {
    targets: CopyTarget[]
    rootDir: string
}
