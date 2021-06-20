<h1 align="center">
 Digital COVID Certificates: Business Rules testdata
</h1>

<p align="center">
    <a href="#about">About</a> •
    <a href="#testing--status">Testing & Status</a> •
    <a href="#licensing">Licensing</a>
</p>


## About

This repository holds business rules to determine whether a person is deemed fit-for-travel into a country-of-arrival (CoA) based on their vaccination, test, and recovery status.
The status of the business rules here is _unofficial_: the actual rules will be available from the DCGC Gateway.
Business rules are specified using the format/language specified in the [DCC Business Rules GitHub repository](https://github.com/ehn-dcc-development/dgc-business-rules).

This repository is intended for development purposes only, with value provided by validation executed per Continuous Integration (CI), for any Pull Request.
Validation encompasses the following:
* The JSON file of every rule is validated against the [Rule JSON Schema](https://github.com/eu-digital-green-certificates/dgc-gateway/blob/feat/validation-rules/src/main/resources/validation-rule.schema.json).
* The `Logic` field of every rule is validated as a CertLogic expression.
* The affected fields of the DCC `payload` accessed from the `Logic` field are compared with the `AffectedFields` field.
* ..._more validations and checks to follow_


## Organisation

This repository contains the following:

* [GitHub Actions configuration](./.github)
* [tests](./tests): testing material called by the “Business Rule Validation” GitHub Action
* [tooling](./tooling): testing material called by the “Certlogic Validation” GitHub Action
* [EU](./EU): EU template rules
* [NL](./NL), etc.: actual rules for EU Member States


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

