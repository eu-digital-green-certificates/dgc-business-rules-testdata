import { writeFileSync } from "fs"
import { format as prettify } from "prettier"
import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { CertLogicRendering } from "./CertLogic"
import { gatherRuleSetsAsMap, readRuleJson, RuleMap } from "./repo-struct"
import { Rule } from "./typings"


const RuleRendering = ({ rule }: { rule: Rule }) => <div>
    <span>rule ID={rule.Identifier}</span>
    <CertLogicRendering expr={rule.Logic} />
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
        {Object.keys(ruleMap).map((ruleId, index) => <RuleRendering rule={readRuleJson(ruleSetId, ruleId)} key={index}/>)}
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
}

