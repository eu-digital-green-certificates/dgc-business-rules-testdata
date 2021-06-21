import { CertLogicExpression } from "certlogic-js"

export type Rule = {
    Identifier: string
    Type: "Acceptance" | "Invalidation"
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

export type RuleSet = { [ ruleId: string]: Rule }

