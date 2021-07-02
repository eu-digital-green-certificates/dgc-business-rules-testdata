import { writeFileSync } from "fs"
import { format as prettify } from "prettier"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { CertLogicRendering } from "./CertLogic"
import { gatherRuleSetsAsMap, readRuleJson, RuleMap } from "./rule-sets"
import { Rule } from "./typings"


const RuleRendering = ({ rule }: { rule: Rule }) => <div className="row">
    <div className="cell"><span>{rule.Identifier}</span></div>
    <div className="cell"><span>{rule.Description[0].desc}</span></div>
    <div className="cell">
        <CertLogicRendering expr={rule.Logic} />
    </div>
</div>


const RuleSetRendering = ({ ruleSetId, ruleMap }: { ruleSetId: string, ruleMap: RuleMap }) => {
    return <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <link href="styling.css" rel="stylesheet"/>
            <title>Rule set: {ruleSetId}</title>
        </head>
        <body>
        <h1>Rule set: {ruleSetId}</h1>
        <div className="table">
            <div className="table-body">
                <div className="row header">
                    <div className="cell"><span>Identifier</span></div>
                    <div className="cell"><span>Description (EN)</span></div>
                    <div className="cell"><span>Logic (compactified notation)</span></div>
                </div>
                {Object.keys(ruleMap).map((ruleId, index) => <RuleRendering rule={readRuleJson(ruleSetId, ruleId)} key={index}/>)}
            </div>
        </div>
        </body>
    </html>
}


const ruleSetsMap = gatherRuleSetsAsMap()

for (const ruleSetId in ruleSetsMap) {
    const htmlPath = `../html/${ruleSetId}.html`
    writeFileSync(
        htmlPath,
        prettify(
            "<!DOCTYPE html>" + renderToStaticMarkup(<RuleSetRendering ruleSetId={ruleSetId} ruleMap={ruleSetsMap[ruleSetId]} />),
            { parser: "html" }
        )
    )
    console.log(`wrote HTML for rule set "${ruleSetId}"`)
}

