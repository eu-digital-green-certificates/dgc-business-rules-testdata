import { lstatSync, readdirSync } from "fs"
import { join } from "path"


const repoRootPath = join(__dirname, "../..")
export const fromRepoRoot = (...paths: string[]) => join(repoRootPath, ...paths)

const allRulesDirs = readdirSync(repoRootPath)
    .filter((path) => !path.startsWith(".") && [ "tests", "tooling" ].indexOf(path) === -1)
    .filter((path) => lstatSync(fromRepoRoot(path)).isDirectory())


export type RuleSetsMap = { [ruleSetId: string]: { ruleFiles: string[] } }


/**
 * Gathers all rules' files from all states' directories.
 */
export const gatherRuleSetsAsMap = (): RuleSetsMap => Object.fromEntries(
        allRulesDirs.map<[ string, { ruleFiles: string[] }]>((ruleDir) => [
            ruleDir,
            {
                ruleFiles: readdirSync(fromRepoRoot(ruleDir))
                    .filter((subPath) => subPath.endsWith(".json")) // TODO  adjust for structuring
            }
        ])
        .filter((entry) => entry[1].ruleFiles.length > 0)
    )

