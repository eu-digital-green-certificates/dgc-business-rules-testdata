import { PathLike, writeFileSync } from "fs"
import { format as prettify } from "prettier"


export const writeHtml = (path: PathLike, html: string) => {
    writeFileSync(
        path,
        prettify("<!DOCTYPE html>" + html, {parser: "html"})
    )
}

