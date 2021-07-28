#!/bin/sh

# Cleans this `tooling/` directory to clean/pre-CI state.

DCC_BR_REPO_NAME=dgc-business-rules

rm $DCC_BR_REPO_NAME 2> /dev/null

npm run clean

rm schemas/validation-rule.schema.json 2> /dev/null

rm package-lock.json 2> /dev/null
rm yarn.lock 2> /dev/null
rm yarn-error.log 2> /dev/null

