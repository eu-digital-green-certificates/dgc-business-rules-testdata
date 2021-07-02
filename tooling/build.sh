#!/bin/sh

REPO_NAME=dgc-testdata

git clone --depth 1 https://github.com/eu-digital-green-certificates/$REPO_NAME.git
# locally, use:   ln -s ../../$REPO_NAME .

# get JSON Schema:
curl https://raw.githubusercontent.com/eu-digital-green-certificates/dgc-gateway/main/src/main/resources/validation-rule.schema.json > schemas/validation-rule.schema.json

mkdir -p ../out

# build and run validation and testing tooling:
npm run clean
npm install
npm run build
npm test

