import { PathLike, readFileSync } from "fs"


export const readJson = (path: PathLike) => {
    try {
        return JSON.parse(readFileSync(path, "utf8").toString())
    } catch (e) {
        console.error(`couldn't read JSON file with path "${path}", due to: ${e}`)
        throw e
    }
}

