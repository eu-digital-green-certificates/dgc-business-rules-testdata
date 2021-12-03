import { CertLogicExpression } from "certlogic-js"


export type RuleType = "Acceptance" | "Invalidation"

export type Rule = {
    Identifier: string
    Type: RuleType
    Country: string
    Version: string
    SchemaVersion: string
    Engine: string
    EngineVersion: string
    CertificateType: "General" | "Test" | "Vaccination" | "Recovery"
    Description: { lang: string, desc: string }[]
    ValidFrom: string
    ValidTo: string
    AffectedFields: string[]
    Logic: CertLogicExpression
}


export type RuleSets = { [ruleSetId: string]: RuleSet }

export type RuleSet = { [ruleId: string]: RuleWithTests}

export type RuleWithTests = {
    def: Rule
    tests: { [testId: string]: RuleTest }
}

export type RuleTest = {
    name?: string
    payload: any
    external: any
    expected: any
}


export type TestResult = {
    evaluationErrorMessage: string
} | {
    actual: any
    asExpected: boolean
} | {
    nowOutsideValidityRange: boolean
}

export type TestResults = { [ruleSetId: string]: { [ruleId: string]: { [testId: string]: TestResult } } }

