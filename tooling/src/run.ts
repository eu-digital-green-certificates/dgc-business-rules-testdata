import { evaluate } from "certlogic-js"
const deepEqual = require("deep-equal")

import { gatherRuleSetsAsMap, readRuleJson, readRuleTestJson } from "./repo-struct"
import { validateRule } from "./validate"


const asPrettyText = (json: any) => JSON.stringify(json, null, 2)


const ruleSetsMap = gatherRuleSetsAsMap()

for (const ruleSetId in ruleSetsMap) {
    for (const ruleId in ruleSetsMap[ruleSetId]) {
        const ruleText = `rule "${ruleId}" in set "${ruleSetId}"`
        const rule = readRuleJson(ruleSetId, ruleId)
        const ruleValidation = validateRule(rule)
        if (ruleValidation.schemaValidationsErrors.length > 0) {
            console.error(`${ruleText} has schema validation errors:`)
            console.error(asPrettyText(ruleValidation.schemaValidationsErrors))
            console.error()
        }
        if (ruleValidation.logicValidationErrors.length > 0) {
            console.error(`CertLogic expression in ${ruleText} has validation errors:`)
            console.error(asPrettyText(ruleValidation.logicValidationErrors))
            console.error()
        }
        if (ruleValidation.affectedFields) {
            console.error(`${ruleText} specifies other affected fields than computed from its CertLogic expression (actual vs. computed):`)
            console.error(asPrettyText(ruleValidation.affectedFields.actual))
            console.error(asPrettyText(ruleValidation.affectedFields.computed))
            console.error()
        }
        for (const testFile of ruleSetsMap[ruleSetId][ruleId].testFiles) {
            const { name, payload, external, expected } = readRuleTestJson(ruleSetId, ruleId, testFile)
            const actual = evaluate(rule.Logic, { payload, external })
            if (!deepEqual(actual, expected)) {
                console.error(`\t\ttest in file "${testFile}" of ${ruleText} doesn't evaluate to expected value, but to:`)
                console.error(asPrettyText(actual))
                console.error()
            }
        }
        console.log(`\tvalidated ${ruleText}`)
    }
    const nRules = Object.keys(ruleSetsMap[ruleSetId]).length
    console.log(`validated rules in rule set with id "${ruleSetId}" (${nRules} rule${nRules === 1 ? "" : "s"})`)
}

