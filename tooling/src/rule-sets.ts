import { existsSync, lstatSync, readdirSync } from "fs"
import { join } from "path"

import { readJson, writeJson } from "./file-utils"
import { fromRepoRoot, repoRootPath } from "./paths"
import { Rule } from "./typings"


const nonRuleSetsDirs = [ "html", "out", "tests", "tooling", "valuesets" ]

const allRuleSetsDirs = readdirSync(repoRootPath)
    .filter((path) => !path.startsWith(".") && nonRuleSetsDirs.indexOf(path) === -1)
    .filter((path) => lstatSync(fromRepoRoot(path)).isDirectory())

const isRuleDir = (path: string) => lstatSync(fromRepoRoot(path)).isDirectory() && existsSync(fromRepoRoot(path, "rule.json"))


export type RuleSets = { [ruleSetId: string]: RuleSet }

export type RuleSet = { [ruleId: string]: RuleWithTests}

export type RuleWithTests = {
    def: Rule
    tests: { [testId: string]: RuleTest }
}

export type RuleTest = {
    name?: string
    payload: any
    external: any
    expected: any
}


/**
 * Gathers all rules' files from all states' directories, including their tests.
 */
export const gatherRuleSets = (): RuleSets => Object.fromEntries(
        allRuleSetsDirs.map((ruleSetDir) => [
            ruleSetDir,
            gatherRuleSet(ruleSetDir)
        ])
    )

const gatherRuleSet = (ruleSetDir: string): RuleSet =>
    Object.fromEntries(
        readdirSync(fromRepoRoot(ruleSetDir))
            .filter((subPath) => isRuleDir(join(ruleSetDir, subPath)))
            .map((ruleId) => [
                ruleId,
                gatherRule(ruleSetDir, ruleId)
            ])
    )

const gatherRule = (ruleSetDir: string, ruleId: string): RuleWithTests =>
    ({
        def: readJson(fromRepoRoot(ruleSetDir, ruleId, "rule.json")),
        tests: Object.fromEntries(
            readdirSync(fromRepoRoot(ruleSetDir, ruleId, "tests"))
                .filter((testPath) => testPath.match(/^test\d+\.json$/))
                .map((testPath) => [
                    testPath.substring(0, testPath.length - ".json".length),
                    readJson(fromRepoRoot(ruleSetDir, ruleId, "tests", testPath))
                ])
        )
    })


writeJson(fromRepoRoot("out", "all-rule-sets-with-tests.json"), gatherRuleSets())

