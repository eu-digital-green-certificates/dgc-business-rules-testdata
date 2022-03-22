/**
 * Map a JS function over all DCC payloads in the dgc-testdata repo,
 * which is assumed to exist right next to this dgc-business-rules repo.
 */


import { PathLike } from "fs"
const readdirRecursive = require("fs-readdir-recursive")
import { join } from "path"

import { readJson } from "./json-utils"


export interface TestFileIdentification {
    memberState: string
    fileName: string
}

export interface MapResult<RT> {
    testFileId: TestFileIdentification
    notJson?: boolean
    result?: RT
}


function mapTestFile<RT>(path: PathLike, func: (json: any) => RT): MapResult<RT> {
    const testJson = readJson(path)
    const fileMatch = path.toString().match(/.+?dgc-testdata\/(.+)\/2DCode\/raw\/(.+?)\.json$/)
    if (!fileMatch) {
        throw new Error(`could not disassemble path "${path}"`)
    }
    const memberState = fileMatch[1]
    const fileName = fileMatch[2]
    /*
    if (!fileName.match(/^\d+$/)) {
        console.warn(`test data file with unconforming name found for member state ${memberState}: '${fileName}'`)
    }
     */
    const testFileId: TestFileIdentification = { memberState, fileName }
    if (!testJson) {
        return {
            testFileId,
            notJson: true
        }
    }
    return {
        testFileId,
        result: func(testJson)
    }
}


const testDataPath = join(__dirname, "../dgc-testdata")
const testFiles = readdirRecursive(testDataPath).filter((path: string) => path.match(/\/raw\/(.+?)\.json$/))


type MapResults<RT> = MapResult<RT>[]

/**
 * Map the given `func` on all payloads in the dgc-testdata repo,
 * gathering the results as a {@see MapResults}.
 */
export function mapOverTestFiles<RT>(func: (testJson: any) => RT): MapResults<RT> {
    return testFiles.map((path: string) => mapTestFile(join(testDataPath, path), func))
}

