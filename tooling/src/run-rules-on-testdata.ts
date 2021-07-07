import { CertLogicExpression, evaluate } from "certlogic-js"

import { writeJson } from "./file-utils"
import { mapOverTestFiles } from "./test-data"
import { gatherRuleSetsAsMap, readRuleJson } from "./rule-sets"
import { fromRepoRoot } from "./paths"


function mapValues<U, V>(map: { [key: string]: U }, mapper: (key: string, u: U) => V) {
    return Object.fromEntries(
        Object.entries(map).map(([ key, u ]) => [ key, mapper(key, u) ])
    )
}


const ruleSets = mapValues(gatherRuleSetsAsMap(), (ruleSetId, ruleMap) => Object.keys(ruleMap).map((ruleId) => readRuleJson(ruleSetId, ruleId)))


const valueSets = require(fromRepoRoot("valuesets/valueSets.json"))


describe("execute all rules on test data", () => {

    writeJson(
        fromRepoRoot("out", "rules-on-testData.json"),
        mapOverTestFiles((testJson: any) =>
            mapValues(ruleSets, (ruleSetId, rules: any[]) => {
                const result = Object.fromEntries(
                    rules.map((rule) => [
                        rule.Identifier,
                        (() => {
                            try {
                                return {
                                    result: evaluate(
                                        rule.Logic as CertLogicExpression,
                                        {
                                            payload: testJson.JSON,
                                            external: {
                                                valueSets,
                                                validationClock: testJson["TESTCTX"]["VALIDATIONCLOCK"]
                                            }
                                        })
                                }
                            } catch (e) {
                                return { errorMessage: e.message }
                            }
                        })
                    ])
                )
                result.allSatisfied = Object.values(result).reduce((acc, x) => acc && !!x, true)
                return result
            })
        )
    )
    it("done", () => {})

})

