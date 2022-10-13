#!/bin/sh

REPO_NAME=dgc-testdata

rm -rf $REPO_NAME/
mkdir -p $REPO_NAME
cd $REPO_NAME
npx degit https://github.com/eu-digital-green-certificates/dgc-testdata#main
# NOTE: If the degit command fails with "! zlib: unexpected end of file", then try deleting the ~/.degit directory entirely!
cd ..

echo "Downloading JSON Schema for rules..."
curl https://raw.githubusercontent.com/eu-digital-green-certificates/dgc-gateway/main/src/main/resources/validation-rule.schema.json > schemas/validation-rule.schema.json

OUT_DIR=../out

echo "Cleaning..."
npm run clean
rm -rf $OUT_DIR
mkdir -p $OUT_DIR

npm install
npm dedupe

echo "Building tooling, running all tests (as Mocha unit tests), and generating HTML..."
npm start

