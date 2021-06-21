import { affectedFields, validateFormat } from "certlogic-validation"

import { readJson } from "./file-utils"
import { fromRepoRoot, readRuleJson } from "./repo-struct"


import Ajv from "ajv"
import { ErrorObject } from "ajv"
const ajv = new Ajv({
    allErrors: true,        // don't stop after 1st error
    strict: true,
    validateSchema: false   // prevent that AJV throws with 'no schema with key or ref "https://json-schema.org/draft/2020-12/schema"'
})
const addFormats = require("ajv-formats")
addFormats(ajv)
const schemaValidator = ajv.compile(readJson(fromRepoRoot("tooling/validation-rule.schema.json")))

const schemaValidationErrorsFor = (json: any): ErrorObject[] => {
    const valid = schemaValidator(json)
    return valid ? [] : schemaValidator.errors!!
}


const areEqual = (leftSet: string[], rightSet: string[]): boolean =>
    leftSet.length === rightSet.length && leftSet.every((item) => rightSet.indexOf(item) > -1)

const validateAffectedFields = (rule: any) => {
    const actual = rule.AffectedFields
    const computed = affectedFields(rule.Logic)
        .filter((fieldName) => fieldName.startsWith("payload."))
        .map((fieldName) => fieldName.substring("payload.".length))
    return areEqual(actual, computed)
        ? null
        : { actual, computed }
}


export const validateRuleFile = (ruleSetId: string, ruleId: string) => {
    const rule = readRuleJson(ruleSetId, ruleId)
    return {
        ruleId: rule.Identifier,
        schemaValidationsErrors: schemaValidationErrorsFor(rule),
        logicValidationErrors: validateFormat(rule.Logic),
        affectedFields: validateAffectedFields(rule)
    }
}


export const validateRuleSet = (ruleSetId: string, ruleIds: string[]) =>
    Object.fromEntries(ruleIds.map((ruleId) => {
        const validationResult = validateRuleFile(ruleSetId, ruleId)
        return [ validationResult.ruleId, validationResult ]
    }))

