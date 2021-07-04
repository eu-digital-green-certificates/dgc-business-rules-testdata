import * as React from "react"
import { renderToStaticMarkup } from "react-dom/server"

import { CertLogicRendering } from "./CertLogic"
import { writeHtml } from "./file-utils"
import { ruleSets } from "./rule-sets"
import { fromRepoRoot } from "./paths"
import { Rule, RuleSet } from "./typings"


const RuleRendering = ({ rule }: { rule: Rule }) => <div className="row">
    <div className="cell"><span>{rule.Identifier}</span></div>
    <div className="cell"><span>{rule.Description[0].desc}</span></div>
    <div className="cell">
        <CertLogicRendering expr={rule.Logic} />
    </div>
</div>


const RuleSetRendering = ({ ruleSetId, ruleSet }: { ruleSetId: string, ruleSet: RuleSet }) => {
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
                {Object.keys(ruleSet).map((ruleId, index) => <RuleRendering rule={ruleSet[ruleId].def} key={index}/>)}
            </div>
        </div>
        </body>
    </html>
}


describe(`writing HTML for rule sets`, () => {
    for (const [ ruleSetId, ruleSet ] of Object.entries(ruleSets)) {
        it(`${ruleSetId}`, () => {
            writeHtml(
                fromRepoRoot("html", `${ruleSetId}.html`),
                renderToStaticMarkup(<RuleSetRendering ruleSetId={ruleSetId} ruleSet={ruleSet} />)
            )
        })
    }
})

