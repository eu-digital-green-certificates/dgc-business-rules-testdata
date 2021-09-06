import { CertLogicExpression, evaluate } from "certlogic-js"
import { join } from "path"

import { writeJson } from "./file-utils"
import { mapValues } from "./func-utils"
import { fromRepoRoot, jsonOutPath } from "./paths"
import { ruleSets } from "./rule-sets"
import { mapOverTestFiles } from "./test-data"


const valueSets = require(fromRepoRoot("valuesets", "valueSets.json"))


type ResultPerRule = {
    result?: any
    errorMessage?: string
}
const isSatisfied = (resultPerRule: ResultPerRule): boolean =>
    "result" in resultPerRule && (typeof resultPerRule.result === "boolean") && resultPerRule.result


describe("execute all rules on test data", () => {

    writeJson(
        join(jsonOutPath, "rules-on-testData.json"),
        mapOverTestFiles((testJson: any) =>
            mapValues(ruleSets, (ruleSetId, ruleSet) => {
                const resultsPerRule: { [ruleId: string]: ResultPerRule } = mapValues(ruleSet, (ruleId, rule) => {
                    try {
                        return {
                            result: evaluate(
                                rule.def.Logic as CertLogicExpression,
                                {
                                    payload: testJson.JSON,
                                    external: {
                                        valueSets,
                                        validationClock: testJson["TESTCTX"]["VALIDATIONCLOCK"]
                                    }
                                })
                        }
                    } catch (e: any) {
                        return { errorMessage: e.message }
                    }
                })
                const allSatisfied = Object.values(resultsPerRule).reduce((acc, resultPerRule) => acc && isSatisfied(resultPerRule), true)
                return {
                    resultsPerRule, allSatisfied
                }
            })
        )
    )
    it("done", () => {})

})

