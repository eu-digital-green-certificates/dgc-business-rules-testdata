import { existsSync, lstatSync, readdirSync } from "fs"
import { join } from "path"
import { readJson } from "./file-utils"


const repoRootPath = join(__dirname, "../..")
export const fromRepoRoot = (...paths: string[]) => join(repoRootPath, ...paths)

const allRuleSetsDirs = readdirSync(repoRootPath)
    .filter((path) => !path.startsWith(".") && [ "html", "tests", "tooling" ].indexOf(path) === -1)
    .filter((path) => lstatSync(fromRepoRoot(path)).isDirectory())


export type RuleMap = { [ ruleId: string ]: { testFiles: string[] } }
export type RuleSetsMap = { [ruleSetId: string]: RuleMap }

const isRuleDir = (path: string) => lstatSync(fromRepoRoot(path)).isDirectory() && existsSync(fromRepoRoot(path, "rule.json"))

const gatherRuleSet = (ruleSetDir: string): RuleMap =>
    Object.fromEntries(
        readdirSync(fromRepoRoot(ruleSetDir))
            .filter((subPath) => isRuleDir(join(ruleSetDir, subPath)))
            .map((ruleId) => [ ruleId, {
                testFiles: readdirSync(fromRepoRoot(ruleSetDir, ruleId, "tests"))
                    .filter((testsPath) => testsPath.match(/^test\d+\.json$/))
            } ])
    )

/**
 * Gathers all rules' files from all states' directories.
 */
export const gatherRuleSetsAsMap = (): RuleSetsMap => Object.fromEntries(
        allRuleSetsDirs.map((ruleSetDir) => [
            ruleSetDir,
            gatherRuleSet(ruleSetDir)
        ])
    )

export const readRuleJson = (ruleSetId: string, ruleId: string) =>
    readJson(fromRepoRoot(ruleSetId, ruleId, "rule.json"))

export const readRuleTestJson = (ruleSetId: string, ruleId: string, testFile: string) =>
    readJson(fromRepoRoot(ruleSetId, ruleId, "tests", testFile))

