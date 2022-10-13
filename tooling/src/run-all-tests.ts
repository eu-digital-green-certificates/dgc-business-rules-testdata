import { evaluate } from "certlogic-js"
import { dateFromString } from "certlogic-js/dist/internals"    // TODO  expose properly from certlogic-js
const assert = require("chai").assert
const { fail } = assert
const deepEqual = require("deep-equal")
import { join } from "path"
import { argv } from "process"

import { asPrettyText, writeJson } from "./json-utils"
import { filterValues, mapValues } from "./func-utils"
import { jsonOutPath } from "./paths"
import { ruleSets } from "./rule-sets"
import { TestResults } from "./typings"
import { hasRulesForAllEventTypes, validateRule } from "dcc-business-rules-utils"


// Note: this assumes that this program is run using `npx mocha dist/run-all-tests.js [ruleSetId] [ruleId]`!
const singleRuleSetId = argv[3]
const singleRuleId = argv[4]

if (singleRuleSetId && !ruleSets[singleRuleSetId]) {
    console.error(`[ERROR]  no rule set with ID="${singleRuleSetId}" exists`)
    process.exit(2)
}
if (singleRuleId && !ruleSets[singleRuleSetId][singleRuleId]) {
    console.error(`[ERROR]  no rule with ID="${singleRuleId}" exists within rule set with ID="${singleRuleSetId}"`)
    process.exit(2)
}

if (!singleRuleSetId) {
    console.log(`Usage (extended): mocha dist/run-all-tests.js [ruleSetId] [ruleId] - to run only the indicated rule set, or even rule within that`)
} else if (!singleRuleId) {
    console.log(`Note: only (showing results of) running rule set with ID="${singleRuleSetId}"`)
} else {
    console.log(`Note: only (showing results of) running rule with ID="${singleRuleId}" in rule set with ID="${singleRuleSetId}"`)
}

const testResults: TestResults =
    mapValues(
        filterValues(ruleSets, (ruleSetId, _) => !singleRuleSetId || singleRuleSetId === ruleSetId),
        (ruleSetId, ruleSet) =>
            mapValues(
                filterValues(ruleSet, (ruleId, _) => !singleRuleId || singleRuleId === ruleId),
                (ruleId, ruleWithTests) => {
                    const rule = ruleWithTests.def
                    return mapValues(ruleWithTests.tests, (testId, test) => {
                        const { payload, external, expected } = test
                        const { validationClock } = external
                        if (validationClock) {
                            const now = dateFromString(validationClock)
                            if (!(dateFromString(rule.ValidFrom) <= now && now < dateFromString(rule.ValidTo))) {
                                return {
                                    nowOutsideValidityRange: true
                                }
                            }
                        }
                        try {
                            const actual = evaluate(rule.Logic, { payload, external })
                            return { actual, asExpected: deepEqual(actual, expected) }
                        } catch (e: any) {
                            return {
                                evaluationErrorMessage: e.message
                            }
                        }
                    })
                }
            )
    )

writeJson(join(jsonOutPath, "results-all-rules-tests.json"), testResults)


/**
 * Run all given thunks, without assertions in them preventing the other thunks from running.
 */
const assertAll = (...thunks: (() => void)[]): void => {
    const failMessages: string[] = []
    thunks.forEach((thunk) => {
        try {
            thunk()
        } catch (e: any) {
            failMessages.push(e.message)
        }
    })
    if (failMessages.length > 0) {
        fail(failMessages.map((message) => `\n\t* ${message}`).join(""))
    }
}


for (const [ ruleSetId, ruleSet ] of Object.entries(ruleSets)) {
    if (singleRuleSetId && singleRuleSetId !== ruleSetId) {
        continue
    }
    if (!hasRulesForAllEventTypes(Object.values(ruleSet).map((ruleWithTests) => ruleWithTests.def))) {
        console.log(`[WARNING] rules of country "${ruleSetId}" don't cover all event types (which is NOT the same as not accepting the event types that weren't covered)`)
    }
    for (const [ ruleId, ruleWithTests ] of Object.entries(ruleSet)) {
        if (singleRuleId && singleRuleId !== ruleId) {
            continue
        }
        const ruleText = `rule "${ruleId}" in set "${ruleSetId}"`
        describe(ruleText, () => {
            const rule = ruleWithTests.def
            it("validates against rule's JSON Schema, other checks, and CertLogic spec", () => {
                const {
                    schemaValidationsErrors,
                    affectedFields,
                    logicValidationErrors,
                    metaDataErrors
                } = validateRule(rule)
                assertAll(() => {
                        if (schemaValidationsErrors.length > 0) {
                            fail(`${ruleText} has schema validation errors: ${schemaValidationsErrors.map(asPrettyText).join(", ")}`)
                        }
                    },
                    () => {
                        if (affectedFields !== null) {
                            assert.deepEqual(
                                affectedFields.actual,
                                affectedFields.computed,
                                `${ruleText} specifies other affected fields than computed from its CertLogic expression (actual vs. computed)`
                            )
                        }
                    },
                    () => {
                        if (logicValidationErrors.length > 0) {
                            fail(`CertLogic expression in ${ruleText} has validation errors: ${asPrettyText(logicValidationErrors)}`)
                        }
                    },
                    () => {
                        // skip errors relating to mismatch of CertificateType and AffectedFields (regardless of the validity of those fields themselves):
                        if (!metaDataErrors.every((errorMessage) => errorMessage.startsWith("CertificateType "))) {
                            fail(`meta data of ${ruleText} has validation errors: ${metaDataErrors.join(", ")}`)
                        }
                    }
                )
            })
            for (const [ testId, test ] of Object.entries(ruleWithTests.tests)) {
                const { name, expected, external } = test
                const testResult = testResults[ruleSetId][ruleId][testId]
                it(`${(name || "<no name>")} (test-ID=${testId})`, () => {
                    if ("nowOutsideValidityRange" in testResult) {
                        fail(`${ruleText} can't pertain to the test in file "${testId}" because ${external.validationClock} is not in the rule's validity range [ ${rule.ValidFrom}, ${rule.ValidTo} ) - please change either the value of external.validationClock or the rule's validity range`)
                    } else if ("evaluationErrorMessage" in testResult) {
                        fail(`exception occurred during evaluation of CertLogic expression: ${testResult.evaluationErrorMessage}`)
                    } else {
                        if (singleRuleSetId || !testResult.asExpected) {
                            console.log(`${ruleText} - test with ID "${testId}":`)
                            console.log(`\tactual result:`)
                            console.dir(testResult.actual)
                            console.log(`\texpected result:`)
                            console.dir(expected)
                            console.log()
                        }
                        if (!testResult.asExpected) {
                            fail(`test with ID "${testId}" of ${ruleText}: actual=[${testResult.actual}] while expected=[${expected}]`)
                        }
                    }
                })
            }
        })
    }
}

