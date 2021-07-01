import { CertLogicExpression, evaluate } from "certlogic-js"

import { writeJson } from "./file-utils"
import { mapOverTestFiles } from "./test-data"
import { gatherRuleSetsAsMap, readRuleJson } from "./rule-sets"
import { fromRepoRoot } from "./paths"


const ruleSetId = "EU"
const ruleIds = Object.keys(gatherRuleSetsAsMap()[ruleSetId])
const rules = ruleIds.map((ruleId) => readRuleJson(ruleSetId, ruleId))

const valueSets = require(fromRepoRoot("valuesets/valueSets.json"))


const createRulesRunner = (rules: any[]) => (testJson: any) => {
    const result: any = Object.fromEntries(
        rules.map((rule) => [
            rule.Identifier,
            evaluate(rule.Logic as CertLogicExpression, {
                payload: testJson.JSON,
                external: {
                    valueSets,
                    validationClock: testJson["TESTCTX"]["VALIDATIONCLOCK"]
                }
            })
        ])
    )
    result.allSatisfied = Object.values(result).reduce((acc, x) => acc && !!x, true)
    return result
}


writeJson(fromRepoRoot("out", "EU-rules-on-testData.json"), mapOverTestFiles(createRulesRunner(rules)))
console.log(`executed EU rules on test data`)

