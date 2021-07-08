#!/bin/sh

REPO_NAME=dgc-testdata

git clone --depth 1 https://github.com/eu-digital-green-certificates/$REPO_NAME.git
# locally, use:   ln -s ../../$REPO_NAME .

echo "Downloading JSON Schema for rules..."
curl https://raw.githubusercontent.com/eu-digital-green-certificates/dgc-gateway/main/src/main/resources/validation-rule.schema.json > schemas/validation-rule.schema.json

OUT_DIR=../out

echo "Cleaning..."
npm run clean
rm -rf $OUT_DIR
mkdir -p $OUT_DIR

npm install

echo "Building tooling, and running all tests (as Mocha unit tests)..."
npm start

