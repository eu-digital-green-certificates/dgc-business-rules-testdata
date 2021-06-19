#!/bin/sh

DCC_BR_REPO_NAME=dgc-business-rules

# build CertLogic dependencies:
ln -s ../../$DCC_BR_REPO_NAME .
#git clone --depth 1 https://github.com/ehn-dcc-development/$DCC_BR_REPO_NAME.git
cd $DCC_BR_REPO_NAME/certlogic
./build-js.sh
cd ../..

# get JSON Schema:
curl https://raw.githubusercontent.com/eu-digital-green-certificates/dgc-gateway/feat/validation-rules/src/main/resources/validation-rule.schema.json > validation-rule.schema.json
patch validation-rule.schema.json schema-patch.json

# build and run validation tooling:
npm install
npm run build
npm start

