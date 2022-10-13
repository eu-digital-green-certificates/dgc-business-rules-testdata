import { existsSync, lstatSync, readdirSync } from "fs"
import { join } from "path"

import { readJson, writeJson } from "./json-utils"
import { mapValues } from "./func-utils"
import { fromRepoRoot, repoRootPath, jsonOutPath } from "./paths"
import { RuleSet, RuleSets, RuleWithTests } from "./typings"


const nonRuleSetsDirs = [
    "out", "tests", "tooling", "valuesets",
    "analysis",     // (for as-yet unpublished WIP)
    "node_modules"  // (aberrant NPM modules dir.)
]

const allRuleSetsDirs = readdirSync(repoRootPath)
    .filter((path) => !path.startsWith(".") && nonRuleSetsDirs.indexOf(path) === -1)
    .filter((path) => lstatSync(fromRepoRoot(path)).isDirectory())

const isRuleDir = (path: string) => lstatSync(fromRepoRoot(path)).isDirectory() && existsSync(fromRepoRoot(path, "rule.json"))


/**
 * Gathers all rules' files from all states' directories, including their tests.
 */
const gatherRuleSets = (): RuleSets => Object.fromEntries(
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


export const ruleSets: RuleSets = gatherRuleSets()
writeJson(join(jsonOutPath, "all-rule-sets-with-tests.json"), ruleSets)


writeJson(
    join(jsonOutPath, "all-rule-sets.json"),
    mapValues(ruleSets, (ruleSetId, ruleSet) =>
        mapValues(ruleSet, (ruleId, rule) =>
            rule.def
        )
    )
)

