import { gatherRuleSetsAsMap } from "./repo-struct"
import { validateRuleSet } from "./validate"


const ruleSetsMap = gatherRuleSetsAsMap()

for (const ruleSetId in ruleSetsMap) {
    const ruleSetValidation = validateRuleSet(ruleSetId, ruleSetsMap[ruleSetId].ruleFiles)
    for (const ruleId in ruleSetValidation) {
        const validationResult = ruleSetValidation[ruleId]
        if (validationResult.schemaValidationsErrors.length > 0) {
            console.error(`rule "${ruleId}" in set "${ruleSetId}" has schema validation errors:`)
            console.error(JSON.stringify(validationResult.schemaValidationsErrors, null, 2))
            console.error()
        }
        if (validationResult.logicValidationErrors.length > 0) {
            console.error(`CertLogic expression in rule "${ruleId}" in set "${ruleSetId}" has validation errors:`)
            console.error(JSON.stringify(validationResult.logicValidationErrors, null, 2))
            console.error()
        }
    }
    console.log(`validated rules in rule set with id "${ruleSetId}"`)
}

