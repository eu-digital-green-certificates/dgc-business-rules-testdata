import { PathLike, readFileSync } from "fs"


export const readJson = (path: PathLike) => JSON.parse(readFileSync(path, "utf8").toString())

