import { join } from "path"

export const repoRootPath = join(__dirname, "../..")
export const fromRepoRoot = (...paths: string[]) => join(repoRootPath, ...paths)

export const jsonOutPath = fromRepoRoot("out")

