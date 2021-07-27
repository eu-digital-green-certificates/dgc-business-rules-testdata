import { PathLike, readFileSync, writeFileSync } from "fs"
import { format as prettify } from "prettier"


export const readJson = (path: PathLike) => {
    try {
        return JSON.parse(readFileSync(path, "utf8").toString())
    } catch (e) {
        console.error(`couldn't read JSON file with path "${path}", due to: ${e}`)
        throw e
    }
}


export const writeJson = (path: PathLike, json: any) => {
    writeFileSync(path, JSON.stringify(json, null, 2), "utf8")
}


export const writeHtml = (path: PathLike, html: string) => {
    writeFileSync(
        path,
        prettify("<!DOCTYPE html>" + html, { parser: "html" })
    )
}

