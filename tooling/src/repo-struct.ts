import { existsSync, lstatSync, readdirSync } from "fs"
import { join } from "path"
import { readJson } from "./file-utils"


const repoRootPath = join(__dirname, "../..")
export const fromRepoRoot = (...paths: string[]) => join(repoRootPath, ...paths)

const allRulesDirs = readdirSync(repoRootPath)
    .filter((path) => !path.startsWith(".") && [ "tests", "tooling" ].indexOf(path) === -1)
    .filter((path) => lstatSync(fromRepoRoot(path)).isDirectory())


export type RuleSetsMap = { [ruleSetId: string]: { ruleIds: string[] } }

const isRuleDir = (path: string) => lstatSync(fromRepoRoot(path)).isDirectory() && existsSync(join(fromRepoRoot(path), "rule.json"))

/**
 * Gathers all rules' files from all states' directories.
 */
export const gatherRuleSetsAsMap = (): RuleSetsMap => Object.fromEntries(
        allRulesDirs.map<[ string, { ruleIds: string[] }]>((ruleDir) => [
            ruleDir,
            {
                ruleIds: readdirSync(fromRepoRoot(ruleDir))
                    .filter((subPath) => isRuleDir(join(ruleDir, subPath)))
            }
        ])
    )

export const readRuleJson = (ruleSetId: string, ruleId: string) =>
    readJson(fromRepoRoot(ruleSetId, ruleId, "rule.json"))

