import { evaluate } from "certlogic-js"
const { deepEqual, fail, isTrue } = require("chai").assert

import { gatherRuleSetsAsMap, readRuleJson, readRuleTestJson } from "./repo-struct"
import { validateRule } from "./validate"


const asPrettyText = (json: any) => JSON.stringify(json, null, 2)


const ruleSetsMap = gatherRuleSetsAsMap()

for (const ruleSetId in ruleSetsMap) {
    for (const ruleId in ruleSetsMap[ruleSetId]) {
        const ruleText = `rule "${ruleId}" in set "${ruleSetId}"`
        describe(ruleText, () => {
            const rule = readRuleJson(ruleSetId, ruleId)
            it("validates against rule's JSON Schema, other checks, and CertLogic spec", () => {
                const { schemaValidationsErrors, affectedFields, logicValidationErrors, metaDataErrors } = validateRule(rule)
                isTrue(schemaValidationsErrors.length === 0, `${ruleText} has schema validation errors: ${schemaValidationsErrors.join(", ")}`)
                if (affectedFields) {
                    deepEqual(affectedFields.actual, affectedFields.computed, `${ruleText} specifies other affected fields than computed from its CertLogic expression (actual vs. computed)`)
                }
                isTrue(logicValidationErrors.length === 0, `CertLogic expression in ${ruleText} has validation errors: ${asPrettyText(logicValidationErrors)}`)
                isTrue(metaDataErrors.length === 0, `meta data of ${ruleText} has validation errors: ${metaDataErrors.join(", ")}`)
            })
            for (const testFile of ruleSetsMap[ruleSetId][ruleId].testFiles) {
                const { name, payload, external, expected } = readRuleTestJson(ruleSetId, ruleId, testFile)
                it(`${(name || "<no name>")} (test-file=${testFile})`, () => {
                    try {
                        const actual = evaluate(rule.Logic, {payload, external})
                        deepEqual(actual, expected, `test in file "${testFile}" of ${ruleText} doesn't evaluate to expected value`)
                    } catch (e) {
                        fail(`exception occurred during evaluation of CertLogic expression: ${e}`)
                    }
                })
            }
        })
    }
}

