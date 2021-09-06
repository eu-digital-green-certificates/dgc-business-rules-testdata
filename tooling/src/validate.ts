import { version } from "certlogic-js"
import { dateFromString } from "certlogic-js/dist/internals"
import { dataAccesses, validateFormat } from "certlogic-js/dist/validation"
import { gt } from "semver"

import { readJson } from "./file-utils"
import { fromRepoRoot } from "./paths"
import { createSchemaValidator } from "./schema-validator"
import { Rule } from "./typings"


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


const validateMetaData = (rule: Rule) => {
    const errors: string[] = []

    const ruleTypes = [ "Acceptance", "Invalidation" ]
    const wrap = (str: string) => `"${str}"`
    if (ruleTypes.indexOf(rule.Type) === -1) {
        errors.push(`Type "${rule.Type}" must be one of [ ${ruleTypes.map(wrap).join(", ")} ]`)
    }
    if (rule.Engine !== "CERTLOGIC") {
        errors.push(`Engine "${rule.Engine}" must be "CERTLOGIC"`)
    }
    if (gt(rule.EngineVersion, version)) {
        errors.push(`EngineVersion ${rule.EngineVersion} is newer than the currently supported version ${version}`)
    }
    if (gt("0.7.5", rule.EngineVersion)) {
        errors.push(`EngineVersion ${rule.EngineVersion} must be 0.7.5 or newer`)
    }
    if (!rule.ValidFrom) {
        errors.push(`ValidFrom must be defined`)
    } else {
        const validFrom = dateFromString(rule.ValidFrom)
        let nowPlus48hours = new Date()
        nowPlus48hours.setUTCHours(nowPlus48hours.getUTCHours() + 48)
        if (nowPlus48hours >= validFrom) {
            console.warn(`\t[WARNING] a rule's ValidFrom has to be at least 48 hours in the future (at the moment of upload)`)
        }
        if (rule.ValidTo) {
            const validTo = dateFromString(rule.ValidTo)
            if (validFrom > validTo) {
                errors.push(`ValidFrom ${rule.ValidFrom} must be before ValidTo ${rule.ValidTo}`)
            }
            let validFromPlus72hours = validFrom
            validFrom.setUTCHours(validFromPlus72hours.getUTCHours() + 72)
            if (validFromPlus72hours >= validTo) {
                errors.push(`validity range ${rule.ValidFrom} - ${rule.ValidTo} of rule must be at least 72 hours long`)
            }
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

