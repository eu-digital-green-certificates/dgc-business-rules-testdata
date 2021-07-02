<h1 align="center">
 Digital COVID Certificates: Business Rules testdata
</h1>

<p align="center">
    <a href="#about">About</a> •
    <a href="#organisation">Organisation</a> •
    <a href="#testing--status">Testing & Status</a> •
    <a href="#licensing">Licensing</a>
</p>


## About

This repository holds business rules to determine whether a person is deemed fit-for-travel into a country-of-arrival (CoA) based on their vaccination, test, and recovery status, as encoded using the Digital COVID Certificate.
The status of the business rules here is _unofficial_: the actual rules will be available from the [DCGC Gateway](https://github.com/eu-digital-green-certificates/dgc-gateway).
Its main purpose is to help with developing _interchangeable_ business rules.

This repository performs automatic validation and testing on all the rules, and their tests, contributed to it.
This validation and testing runs on every Pull Request, but can also be run locally from the commandline, as follows:

    $ (cd tooling ; sh build.sh)

The “CertLogic Validation” GitHub Action performs this exact same command.
It requires a UNIX-like shell, Git, `curl`, and a recent Node.js (with the NPM package manager) to be installed.

After having run this command once, you can just run the validation/testing as follows:

    $ (cd tooling ; npm test)

Validation encompasses the following:
* The JSON file of every rule is validated against [this JSON Schema](https://github.com/eu-digital-green-certificates/dgc-gateway/blob/main/src/main/resources/validation-rule.schema.json).
* The `Logic` field of every rule is validated as a CertLogic expression, which is a format/language that's [specified here](https://github.com/ehn-dcc-development/dgc-business-rules/specification/README.md).
* The specified `AffectedFields` field is checked against the fields of the DCC `payload` accessed from the `Logic` field.
* ..._more validations and checks to follow_

Testing means that all rules' tests are executed using the JS-implementation of CertLogic.
JSON files containing tests must adhere to [this JSON Schema](./tooling/validation-rule-test.schema.json).

All rules are also executed against every DCC found in the [DCC test data repo](https://github.com/eu-digital-green-certificates/dgc-testdata).
The results are exposed as an artifact (called `rules-on-testData.json`) of the "Validation and Testing of Rule Sets" GitHub Action.


## Organisation

This repository contains the following:

* [GitHub Actions configuration](./.github)
* [tests](./tests): testing material called by the “Business Rule Validation” GitHub Action
* [tooling](./tooling): testing material called by the “CertLogic Validation” GitHub Action
* [EU](./EU): EU template/recommendation rules
* [DE](./DE), [FI](./FI), [NL](./NL), etc.: actual rules for EU Member States


## Testing & Status

- If you found any problems, please create an [Issue](/../../issues).
- Current status: Work-In-Progress + see above.


## Licensing

Copyright (c) 2021 Dutch Ministry of Health, Science, and Sports, and all other contributors

Licensed under the **Apache License, Version 2.0** (the "License"); you may not use this file except in compliance with the License.

You may obtain a copy of the License at https://www.apache.org/licenses/LICENSE-2.0.

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" 
BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the [LICENSE](./LICENSE) for the specific 
language governing permissions and limitations under the License.

