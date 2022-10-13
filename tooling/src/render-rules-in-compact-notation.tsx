import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { writeHtml } from "./html-utils"
import { ruleSets } from "./rule-sets"
import { fromRepoRoot } from "./paths"
import { RuleSet } from "./typings"
import { dataAccesses } from "certlogic-js/dist/validation"
import { CompactExprRendering } from "certlogic-html"
import { Rule } from "dcc-business-rules-utils"


const RuleRendering = ({ rule }: { rule: Rule }) => {
    const expr = rule.Logic
    const externalParametersAccessed = dataAccesses(expr).filter((path) => path.startsWith("external.") && !path.startsWith("external.valueSets"))
    return <div className="row">
        <div className="cell"><span>{rule.Identifier}</span></div>
        <div className="cell"><span>{rule.Description[0].desc}</span></div>
        <div className="cell">
            <div><span className="keyword">Given a DCC {externalParametersAccessed ? " and some external parameters" : ""},</span></div>
            <div><span className="keyword">when </span><CompactExprRendering expr={expr}/><span>,</span></div>
            <div><span className="keyword">then that DCC is </span><span>{rule.Type === "Acceptance" ? "Accepted" : "Invalidated"}</span><span>.</span></div>
        </div>
    </div>
}


const RuleSetRendering = ({ ruleSetId, ruleSet }: { ruleSetId: string, ruleSet: RuleSet }) => {
    return <html lang="en">
        <head>
            <meta charSet="utf-8"/>
            <link href="styling.css" rel="stylesheet"/>
            <title>{`Rule set: ${ruleSetId}`}</title>
        </head>
        <body>
        <h1>{`Rule set: ${ruleSetId}`}</h1>
        <div className="table">
            <div className="table-body">
                <div className="row header">
                    <div className="cell"><span>Identifier</span></div>
                    <div className="cell"><span>Description (EN)</span></div>
                    <div className="cell"><span>Logic (compactified notation)</span></div>
                </div>
                {Object.keys(ruleSet).map((ruleId, index) => <RuleRendering rule={ruleSet[ruleId].def} key={index}/>)}
            </div>
        </div>
        </body>
    </html>
}


describe(`writing HTML for rule sets`, () => {
    for (const [ ruleSetId, ruleSet ] of Object.entries(ruleSets)) {
        it(`${ruleSetId}`, (done) => {
            writeHtml(
                fromRepoRoot("html", `${ruleSetId}.html`),
                renderToStaticMarkup(<RuleSetRendering ruleSetId={ruleSetId} ruleSet={ruleSet} />)
            )
            done()
        }).timeout(5000)    // ensure enough time
    }
})

