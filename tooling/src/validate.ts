import { validateFormat } from "certlogic-validation"

import { readJson } from "./file-utils"
import { fromRepoRoot } from "./repo-struct"


import Ajv from "ajv"
import { ErrorObject } from "ajv"
const ajv = new Ajv({
    allErrors: true,        // don't stop after 1st error
    strict: false,          // TODO  define own "valueset-uri" keyword
    validateSchema: false   // prevent that AJV throws with 'no schema with key or ref "https://json-schema.org/draft/2020-12/schema"'
})
const addFormats = require("ajv-formats")
addFormats(ajv)
const schemaValidator = ajv.compile(readJson(fromRepoRoot("tooling/validation-rule.schema.json")))

const schemaValidationErrorsFor = (json: any): ErrorObject[] => {
    const valid = schemaValidator(json)
    return valid ? [] : schemaValidator.errors!!
}


export const validateRuleFile = (ruleFile: string, ruleSetId: string) => {
    const rule = readJson(fromRepoRoot(ruleSetId, ruleFile))
    return {
        ruleId: rule.Identifier,
        schemaValidationsErrors: schemaValidationErrorsFor(rule),
        logicValidationErrors: validateFormat(rule.Logic)
    }
}


export const validateRuleSet = (ruleSetId: string, ruleFiles: string[]) =>
    Object.fromEntries(ruleFiles.map((ruleFile) => {
        const validationResult = validateRuleFile(ruleFile, ruleSetId)
        return [ validationResult.ruleId, validationResult ]
    }))

