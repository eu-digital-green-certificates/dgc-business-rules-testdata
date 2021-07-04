import { evaluate } from "certlogic-js"
const { deepEqual, fail, isTrue } = require("chai").assert

import { gatherRuleSets } from "./rule-sets"
import { validateRule } from "./validate"


const asPrettyText = (json: any) => JSON.stringify(json, null, 2)


for (const [ ruleSetId, ruleSet ] of Object.entries(gatherRuleSets())) {
    for (const [ ruleId, ruleWithTests ] of Object.entries(ruleSet)) {
        const ruleText = `rule "${ruleId}" in set "${ruleSetId}"`
        describe(ruleText, () => {
            const rule = ruleWithTests.def
            it("validates against rule's JSON Schema, other checks, and CertLogic spec", () => {
                const { schemaValidationsErrors, affectedFields, logicValidationErrors, metaDataErrors } = validateRule(rule)
                isTrue(schemaValidationsErrors.length === 0, `${ruleText} has schema validation errors: ${schemaValidationsErrors.join(", ")}`)
                if (affectedFields) {
                    deepEqual(affectedFields.actual, affectedFields.computed, `${ruleText} specifies other affected fields than computed from its CertLogic expression (actual vs. computed)`)
                }
                isTrue(logicValidationErrors.length === 0, `CertLogic expression in ${ruleText} has validation errors: ${asPrettyText(logicValidationErrors)}`)
                isTrue(metaDataErrors.length === 0, `meta data of ${ruleText} has validation errors: ${metaDataErrors.join(", ")}`)
            })
            for (const [ testId, test ] of Object.entries(ruleWithTests.tests)) {
                const { name, payload, external, expected } = test
                it(`${(name || "<no name>")} (test-ID=${testId})`, () => {
                    try {
                        const actual = evaluate(rule.Logic, { payload, external })
                        deepEqual(actual, expected, `test with ID "${testId}" of ${ruleText} doesn't evaluate to expected value`)
                    } catch (e) {
                        fail(`exception occurred during evaluation of CertLogic expression: ${e}`)
                    }
                })
            }
        })
    }
}

