import {evaluate} from "certlogic-js"
import {gatherRuleSetsAsMap, readRuleJson, readRuleTestJson} from "./repo-struct"
import {validateRule} from "./validate"

const { deepEqual, fail } = require("chai").assert


const asPrettyText = (json: any) => JSON.stringify(json, null, 2)


const ruleSetsMap = gatherRuleSetsAsMap()

for (const ruleSetId in ruleSetsMap) {
    for (const ruleId in ruleSetsMap[ruleSetId]) {
        const ruleText = `rule "${ruleId}" in set "${ruleSetId}"`
        describe(ruleText, () => {
            const rule = readRuleJson(ruleSetId, ruleId)
            it("validates against rule's JSON Schema, other checks, and CertLogic spec", () => {
                const ruleValidation = validateRule(rule)
                if (ruleValidation.schemaValidationsErrors.length > 0) {
                    console.error(`${ruleText} has schema validation errors:`)
                    console.error(asPrettyText(ruleValidation.schemaValidationsErrors))
                    fail("schema validation")
                }
                if (ruleValidation.affectedFields) {
                    console.error(`${ruleText} specifies other affected fields than computed from its CertLogic expression (actual vs. computed):`)
                    console.error(asPrettyText(ruleValidation.affectedFields.actual))
                    console.error(asPrettyText(ruleValidation.affectedFields.computed))
                    fail("affected fields")
                }
                if (ruleValidation.logicValidationErrors.length > 0) {
                    console.error(`CertLogic expression in ${ruleText} has validation errors:`)
                    console.error(asPrettyText(ruleValidation.logicValidationErrors))
                    fail("logic validation (CertLogic)")
                }
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

