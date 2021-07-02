import { version } from "certlogic-js"
import { dataAccesses, validateFormat } from "certlogic-validation"
import { gt } from "semver"

import { readJson } from "./file-utils"
import { fromRepoRoot } from "./paths"
import { createSchemaValidator } from "./schema-validator"


const ruleSchemaValidator = createSchemaValidator(readJson(fromRepoRoot("tooling/schemas/validation-rule.schema.json")))


const areEqual = (leftSet: string[], rightSet: string[]): boolean =>
    leftSet.length === rightSet.length && leftSet.every((item) => rightSet.indexOf(item) > -1)

const validateAffectedFields = (rule: any): null | { actual: string[], computed: string[] } => {
    const actual = rule.AffectedFields
    const computed = dataAccesses(rule.Logic)
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
        schemaValidationsErrors: ruleSchemaValidator(rule),
        logicValidationErrors: validateFormat(rule.Logic),
        affectedFields: validateAffectedFields(rule),
        metaDataErrors: validateMetaData(rule)
    })

