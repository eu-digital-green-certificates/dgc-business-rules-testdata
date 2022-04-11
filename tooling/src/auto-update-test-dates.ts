import { TimeUnit } from "certlogic-js"
import { dateFromString } from "certlogic-js/dist/internals"    // TODO  expose properly from certlogic-js
import { join } from "path"
import { argv } from "process"

import { writeJson } from "./json-utils"
import { ms2months, plusDateTime } from "./datetime-utils"
import { filterValues, mapValues } from "./func-utils"
import { repoRootPath } from "./paths"
import { ruleSets } from "./rule-sets"


const singleRuleSetId = argv[2]
const singleRuleId = argv[3]

if (singleRuleSetId !== "dist/") {  // prevent running on `[npx] mocha dist/`

    if (singleRuleSetId && !ruleSets[singleRuleSetId]) {
        console.error(`[ERROR]  no rule set with ID="${singleRuleSetId}" exists`)
        process.exit(2)
    }
    if (singleRuleId && !ruleSets[singleRuleSetId][singleRuleId]) {
        console.error(`[ERROR]  no rule with ID="${singleRuleId}" exists within rule set with ID="${singleRuleSetId}"`)
        process.exit(2)
    }

    if (!singleRuleSetId) {
        console.log(`Usage (extended): node dist/auto-update-test-dates.js [ruleSetId] [ruleId] - to update only the indicated rule set, or even rule within that`)
    } else if (!singleRuleId) {
        console.log(`Note: updating tests for rule set with ID="${singleRuleSetId}"`)
    } else {
        console.log(`Note: updating tests for rule with ID="${singleRuleId}" in rule set with ID="${singleRuleSetId}"`)
    }


    const plusDatetimes = (json: any, amount: number, unit: TimeUnit) => {

        const recurse = (thing: any) => {
            if (Array.isArray(thing)) {
                thing.forEach(recurse)
            } else if (typeof thing === "object") {
                for (const propertyKey in thing) {
                    if (thing.hasOwnProperty(propertyKey)) {
                        const value = thing[propertyKey]
                        if (typeof value === "string") {
                            try {
                                dateFromString(value)
                                try {
                                    thing[propertyKey] = plusDateTime(value, amount, unit)
                                } catch (e) {
                                    console.dir(e)
                                }
                            } catch (e) {
                                // Do nothing, because it's not a date(time).
                            }
                        } else if (typeof value === "object") {
                            recurse(value)
                        }
                    }
                }
            }
        }

        recurse(json)
    }


    mapValues(
        filterValues(ruleSets, (ruleSetId, _) => !singleRuleSetId || singleRuleSetId === ruleSetId),
        (ruleSetId, ruleSet) =>
            mapValues(
                filterValues(ruleSet, (ruleId, _) => !singleRuleId || singleRuleId === ruleId),
                (ruleId, ruleWithTests) => {
                    const rule = ruleWithTests.def
                    return mapValues(ruleWithTests.tests, (testId, test) => {
                        const { external } = test
                        const { validationClock } = external
                        if (validationClock) {
                            const now = dateFromString(validationClock)
                            if (!(dateFromString(rule.ValidFrom) <= now && now < dateFromString(rule.ValidTo))) {
                                const msDiff = dateFromString(rule.ValidFrom) as any - (now as any) // FIXME  why isn't TypeScript aware of being able to do arithmetic on Date-s?
                                const monthsDiff = 1 + ms2months(msDiff)
                                console.log(`date(time)s in ${ruleSetId}/${ruleId}/${testId}.json are moved ${monthsDiff} month${monthsDiff > 1 ? "s" : ""} forward`)
                                plusDatetimes(test, monthsDiff, "month")
                                writeJson(join(repoRootPath, ruleSetId, ruleId, "tests", `${testId}.json`), test)
                            }
                        }
                    })
                }
            )
    )

}

