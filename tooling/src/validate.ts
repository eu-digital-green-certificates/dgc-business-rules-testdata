import { version } from "certlogic-js"
import { affectedFields, validateFormat } from "certlogic-validation"
import { gt } from "semver"

import { readJson } from "./file-utils"
import { fromRepoRoot } from "./repo-struct"


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

const validateAffectedFields = (rule: any): null | { actual: string[], computed: string[] } => {
    const actual = rule.AffectedFields
    const computed = affectedFields(rule.Logic)
        .filter((fieldName) => fieldName.startsWith("payload."))
        .map((fieldName) => fieldName.substring("payload.".length))
    return areEqual(actual, computed)
        ? null
        : { actual, computed }
}


const validateMetaData = (rule: any) => {
    const errors: string[] = []

    if (rule.Type !== "Acceptance") {
        errors.push(`don't know what to do with a rule of Type other than "Acceptance"`)
    }
    if (rule.Engine !== "CERTLOGIC") {
        errors.push(`don't know what to do with a rule for Engine other than "CERTLOGIC"`)
    }
    if (gt(rule.EngineVersion, version)) {
        errors.push(`don't know what to do with a rule for engine with EngineVersion ${rule.EngineVersion} which is newer than ${version}`)
    }
    if (gt("0.7.5", rule.EngineVersion)) {
        errors.push(`EngineVersion must be 0.7.5 or newer`)
    }
    if (rule.ValidTo) {
        const validFrom = new Date(rule.ValidFrom)
        const validTo = new Date(rule.ValidTo)
        if (validFrom > validTo) {
            errors.push(`ValidFrom must be before after ValidTo`)
        }
    }

    return errors
}


export const validateRule = (rule: any) => ({
        ruleId: rule.Identifier,
        schemaValidationsErrors: schemaValidationErrorsFor(rule),
        logicValidationErrors: validateFormat(rule.Logic),
        affectedFields: validateAffectedFields(rule),
        metaDataErrors: validateMetaData(rule)
    })

