import * as React from "react"

import { Rule, RuleSet, RuleSets, TestResults } from "./typings"


const sortWithHead = (strings: string[], head: string) =>
    [
        ...strings.filter((str) => str === head),
        ...strings.filter((str) => str !== head)
    ]


export const AllRuleSetsWithTestsResults = ({ ruleSets, testResults }: { ruleSets: RuleSets, testResults: TestResults }) => {
    const ruleSetIdsInOrder = sortWithHead(Object.keys(ruleSets), "EU")
    return <html lang="en">
    <head>
        <meta charSet="utf-8"/>
        <link href="styling.css" rel="stylesheet"/>
        <title>All rule sets with tests and results</title>
    </head>
    <body>

    <h1>All rule sets with tests and results</h1>

    <p>
        Index of all rule sets:
    </p>
    <ol>
        {ruleSetIdsInOrder.map((ruleSetId, index) => <li key={index}><a href={`#rule-set-${ruleSetId}`}>{ruleSetId}</a></li>)}
    </ol>

    {ruleSetIdsInOrder.map((ruleSetId, index) => <RuleSetRender ruleSetId={ruleSetId} ruleSet={ruleSets[ruleSetId]} key={index} />)}

    </body>
    </html>
}


const RuleSetRender = ({ ruleSetId, ruleSet }: { ruleSetId: string, ruleSet: RuleSet }) => <div>
    <h2 id={`rule-set-${ruleSetId}`}>Rule set for: {ruleSetId}</h2>
    <div className="table">
        <div className="table-body">
            <div className="row header">
                <div className="cell identifier"><span>Identifier</span></div>
                <div className="cell"><span>Description (EN)</span></div>
            </div>
            {Object.entries(ruleSet).map(([ ruleId, rule ], index) => <RuleRender rule={rule.def} key={index}/>)}
        </div>
    </div>
</div>


const RuleRender = ({ rule }: { rule: Rule }) =>
    <div className="row">
        <div className="cell identifier"><span>{rule.Identifier}</span></div>
        <div className="cell"><span>{rule.Description[0].desc}</span></div>
    </div>

