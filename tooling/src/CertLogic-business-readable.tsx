import * as React from "react"

import { CertLogicExpression, isInt } from "certlogic-js"
import { dataAccesses } from "certlogic-js/dist/validation"
import { RuleType } from "./typings"


export const CertLogicBusinessReadableRendering = ({ ruleType, expr }: { ruleType: RuleType, expr: CertLogicExpression }) => {
    const externalParametersAccessed = dataAccesses(expr).filter((path) => path.startsWith("external.") && !path.startsWith("external.valueSets"))
    return <div>
        <div><span className="keyword">Given a DCC {externalParametersAccessed ? " and some external parameters" : ""},</span></div>
        <div><span className="keyword">when </span><ExprRender expr={expr}/><span>,</span></div>
        <div><span className="keyword">then that DCC is </span><span>{ruleType === "Acceptance" ? "Accepted" : "Invalidated"}</span><span>.</span></div>
    </div>
}


const ExprRender = ({ expr }: { expr: CertLogicExpression }) => {
    if (typeof expr === "string") {
        return <span className="simple-value">{expr}</span>
    }
    if (isInt(expr)) {
        return <span className="simple-value">{expr}</span>
    }
    if (typeof expr === "boolean") {
        return <span className="simple-value">{expr ? "yes" : "no"}</span>
    }
    if (Array.isArray(expr)) {
        return <div className="array">
            <span className="keyword push-right">[</span>
            {(expr as CertLogicExpression[]).map((subExpr, index) =>
                <div className="inline" key={index}>
                    {index > 0 && <span className="push-right">,</span>}
                    <ExprRender expr={subExpr} key={index} />
                </div>
            )}
            <span className="keyword push-left">]</span>
        </div>
    }
    if (typeof expr === "object") {
        const keys = Object.keys(expr)
        const operator = keys[0]
        const values = (expr as any)[operator]
        switch (operator) {
            case "and": {
                if (values.length === 2) {
                    return <div className="operation">
                        <ExprRender expr={values[0]} />
                        <span className="keyword push-both">and</span>
                        <ExprRender expr={values[1]} />
                    </div>
                }
                return <div className="operation">
                    <span className="variadic-operator">and</span>
                    <div className="indent">
                        {values.map((subExpr: CertLogicExpression, index: number) => <div key={index}><ExprRender expr={subExpr} /></div>)}
                    </div>
                </div>
            }
            case "===":
            case ">":
            case "<":
            case ">=":
            case "<=":
            case "after":
            case "before":
            case "not-after":
            case "not-before":
            case "+":
            case "in": {
                return <div className="operation">
                    <ExprRender expr={values[0]} />
                    <span className="keyword push-both">{operator}</span>{/* TODO  prettify operator */}
                    <ExprRender expr={values[1]} />
                </div>
            }
            case "if": {
                const [ guard, then, else_ ] = values
                return <div className="operation">
                    <span className="keyword push-both">if</span>
                    <ExprRender expr={guard} />
                    <span className="keyword push-both">then</span>
                    <ExprRender expr={then} />
                    <span className="keyword push-both">else</span>
                    <ExprRender expr={else_} />
                </div>
            }
            case "plusTime": {
                const [ operand, amount, unit ] = values
                return <div className="operation">
                    <ExprRender expr={operand} />
                    {amount >= 0 && <span className="keyword push-both">+</span>}
                    <span className="simple-value">{amount}</span>
                    <span className="push-left keyword">{unit + (amount === 1 ? "" : "s")}</span>
                </div>
            }
            case "reduce": {
                return <div className="operation">
                    <ExprRender expr={values[0]} />
                    <span className="keyword">.reduce(</span><span className="signature push-right">(accumulator, current) &rarr;</span>
                    <ExprRender expr={values[1]} />
                    <span className="keyword push-right">,</span>
                    <span className="signature push-right">initial:</span>
                    <ExprRender expr={values[2]} />
                    <span className="keyword">)</span>
                </div>
            }
            case "var": {
                return <div className="operation">
                    <span className="keyword">/</span><span className="path">{values}</span>
                </div>
            }
            case "!": {
                return <div className="operation">
                    <span className="keyword push-right">!</span>
                    <ExprRender expr={values[0]} />
                </div>
            }
        }
    }
    return <span className="error">no rendering defined (yet) for: {JSON.stringify(expr)}</span>
}

