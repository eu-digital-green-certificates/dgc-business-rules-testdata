#!/bin/sh

REPO_NAME=dgc-testdata

git clone --depth 1 https://github.com/eu-digital-green-certificates/$REPO_NAME.git
# locally, use:   ln -s ../../$REPO_NAME .

# get JSON Schemas:
curl https://raw.githubusercontent.com/eu-digital-green-certificates/dgc-gateway/main/src/main/resources/validation-rule.schema.json > validation-rule.schema.json
curl https://raw.githubusercontent.com/ehn-dcc-development/ehn-dcc-schema/release/1.3.0/DCC.combined-schema.json > dcc.schema.json

# build and run validation and testing tooling:
npm run clean
npm install
npm run build
npm test

mkdir -p ../out

