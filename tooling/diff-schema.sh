#!/bin/sh

# Updates the `schema.patch` file when changes are made to `validation-rule.schema.json`.

ORIG_SCHEMA=original-validation-rule.schema.json
curl https://raw.githubusercontent.com/eu-digital-green-certificates/dgc-gateway/feat/validation-rules/src/main/resources/validation-rule.schema.json > $ORIG_SCHEMA
diff $ORIG_SCHEMA validation-rule.schema.json > schema.patch
rm $ORIG_SCHEMA

