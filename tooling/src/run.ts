import { gatherRuleSetsAsMap } from "./repo-struct"
import { validateRuleSet } from "./validate"


const asPrettyText = (json: any) => JSON.stringify(json, null, 2)


const ruleSetsMap = gatherRuleSetsAsMap()

for (const ruleSetId in ruleSetsMap) {
    const ruleSetValidation = validateRuleSet(ruleSetId, ruleSetsMap[ruleSetId].ruleFiles)
    for (const ruleId in ruleSetValidation) {
        const ruleText = `\`rule "${ruleId}" in set "${ruleSetId}"`
        const validationResult = ruleSetValidation[ruleId]
        if (validationResult.schemaValidationsErrors.length > 0) {
            console.error(`${ruleText} has schema validation errors:`)
            console.error(asPrettyText(validationResult.schemaValidationsErrors))
            console.error()
        }
        if (validationResult.logicValidationErrors.length > 0) {
            console.error(`CertLogic expression in ${ruleText} has validation errors:`)
            console.error(asPrettyText(validationResult.logicValidationErrors))
            console.error()
        }
        if (validationResult.affectedFields) {
            console.error(`${ruleText} specifies other affected fields than computed from its CertLogic expression (actual vs. computed):`)
            console.error(asPrettyText(validationResult.affectedFields.actual))
            console.error(asPrettyText(validationResult.affectedFields.computed))
            console.error()
        }
    }
    console.log(`validated rules in rule set with id "${ruleSetId}"`)
}

