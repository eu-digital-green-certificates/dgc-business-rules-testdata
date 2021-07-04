import { CertLogicExpression, evaluate } from "certlogic-js"

import { writeJson } from "./file-utils"
import { mapValues } from "./func-utils"
import { mapOverTestFiles } from "./test-data"
import { ruleSets } from "./rule-sets"
import { fromRepoRoot } from "./paths"


const valueSets = require(fromRepoRoot("valuesets", "valueSets.json"))


describe("execute all rules on test data", () => {

    writeJson(
        fromRepoRoot("out", "rules-on-testData.json"),
        mapOverTestFiles((testJson: any) =>
            mapValues(ruleSets, (ruleSetId, ruleSet) => {
                const result = Object.fromEntries(
                    Object.values(ruleSet)
                        .map((rule) => [
                        rule.def.Identifier,
                        evaluate(rule.def.Logic as CertLogicExpression, {
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
            })
        )
    )
    it("done", () => {})

})

