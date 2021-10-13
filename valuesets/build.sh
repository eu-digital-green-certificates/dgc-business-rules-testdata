#!/bin/sh

VALUESETS_REPO_NAME=ehn-dcc-valuesets

git clone --depth 1 https://github.com/ehn-dcc-development/$VALUESETS_REPO_NAME.git
# locally, use:   ln -s ../../$VALUESETS_REPO_NAME .

if [ -d "$VALUESETS_REPO_NAME" ]
then
  jq --slurp 'map( { (.valueSetId): .valueSetValues|keys }) | add'\
    $VALUESETS_REPO_NAME/country-2-codes.json\
    $VALUESETS_REPO_NAME/disease-agent-targeted.json\
    $VALUESETS_REPO_NAME/test-manf.json\
    $VALUESETS_REPO_NAME/test-result.json\
    $VALUESETS_REPO_NAME/test-type.json\
    $VALUESETS_REPO_NAME/vaccine-mah-manf.json\
    $VALUESETS_REPO_NAME/vaccine-medicinal-product.json\
    $VALUESETS_REPO_NAME/vaccine-prophylaxis.json\
      > valueSets.json
  echo "Compressed value sets."
else
  echo "expected $VALUESETS_REPO_NAME to exist"
fi

