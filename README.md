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
The status of the business rules here is _unofficial_: the actual rules are available from the [DCC Gateway](https://github.com/eu-digital-green-certificates/dgc-gateway).
The main purpose of this repository is to help with developing _interchangeable_ business rules.
As such, it's also useful for testing and staging these business rules prior to uploading to the DCC Gateway.

This repository performs automatic validation and testing on all the rules, and their tests, contributed to it.
This validation and testing runs on every Pull Request, but can also be run locally from the commandline, as follows:

    $ ./build.sh

The “Validation and Testing of Rule Sets” GitHub Action performs this exact same command.
This script has the following prerequisites to be installed:

* A UNIX-like shell
* Git
* `curl`
* a recent Node.js (developed on version 16.10; version 14.17 is already too old, apparently), with either the NPM package manager co-installed, or alternatively: [yarn](https://yarnpkg.com/)
* the [`jq` JSON processor](https://stedolan.github.io/jq/)

After having run this command once (succesfully, without exiting with an exit code other than 0), you run the validation, testing, and generation of HTML directly as follows:

    $ (cd tooling ; npm start)

_Validation_ encompasses the following:
* The JSON file of every rule is validated against [this JSON Schema](https://github.com/eu-digital-green-certificates/dgc-gateway/blob/main/src/main/resources/validation-rule.schema.json).
* The `Logic` field of every rule is validated as a CertLogic expression, which is a format/language that's [specified here](https://github.com/ehn-dcc-development/dgc-business-rules/blob/main/certlogic/specification/README.md).
* The specified `AffectedFields` field is checked against the fields of the DCC `payload` accessed from the `Logic` field.
* The rule's (other) metadata is checked against known constraints that the EU DCC Gateway imposes - see [this description of such constraints](./tooling/Gateway-constraints.adoc).

_Testing_ means that all rules' tests are executed using the JS-implementation of CertLogic.
JSON files containing tests must adhere to [this JSON Schema](./tooling/schemas/validation-rule-test.schema.json).
Other constraints that tests must adhere to:

* The verification timestamp in `external.validationClock` has to lie in the rule's *validity range* (`ValidFrom` - `ValidUntil`).
* Validating the rule against the payload in the test must produce the expected result, and not throw an error.

All rules are also executed against every DCC found in the [DCC test data repo](https://github.com/eu-digital-green-certificates/dgc-testdata).
The results are exposed as an artifact (called `rules-on-testData.json`) of the "Validation and Testing of Rule Sets" GitHub Action.

To execute the tests on the rules of a specific rule set, or even a specific rule, you can run the following (from `tooling/`):

    $ ./node_modules/.bin/mocha dist/run-all-test.js [ruleSetId] [[ruleId]]


### Miscellaneous tools

_HTML generation_ generates a HTML page for all rule sets in the directory `html/`.
Those generated HTML pages are also exported as an artifact of the “Validation and Testing of Rule Sets” GitHub Action.

When a rule's `ValidFrom` changes, the tests for that rule might have to be updated as well: the verification timestamp in `external.validationClock` has to be between the indicated `ValidFrom` and `ValidUntil` - its validity range.
Updating the tests can be quite tedious.
To help with that, you can use the `auto-update-test-dates` Node.js program, as follows (from `tooling/`):

    $ node dist/auto-update-test-dates.js [ruleSetId] [[ruleId]]

This updates the dates occurring in the payload, as well as the value of `external.validationClock` to be valid w.r.t. the indicated validity range.
It does so by adding an integer number of months to the relevant dates.

Use of this tool is at your own risk!
You have to check the changes yourself, as the change could alter the meaning of the test.
(Also, the test's `name` field is not updated, so might be out-of-sync.)


## Organisation

This repository contains the following:

* [GitHub Actions configuration](./.github)
* [tests](./tests): testing material called by the “Business Rule Validation” GitHub Action
* [tooling](./tooling): testing material called by the “Validation and Testing of Rule Sets” GitHub Action
* [valuesets](./valuesets): “compress” the value sets for use with validation rule evaluation - see that [README](./valuesets/README.md)
* [EU](./EU): EU template/recommendation rules
* [DE](./DE), [FI](./FI), [NL](./NL), etc.: rules for EU Member States
* [build.sh](./build.sh): a build script to build the compressed value sets, build the tooling, and run all tests


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

