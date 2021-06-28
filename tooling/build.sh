#!/bin/sh

# get JSON Schema:
curl https://raw.githubusercontent.com/eu-digital-green-certificates/dgc-gateway/main/src/main/resources/validation-rule.schema.json > validation-rule.schema.json

# build and run validation and testing tooling:
npm run clean
npm install
npm run build
npm test

