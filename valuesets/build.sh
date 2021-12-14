#!/bin/sh

valueSets="country-2-codes.json \
  disease-agent-targeted.json\
  test-manf.json\
  test-result.json\
  test-type.json\
  vaccine-mah-manf.json\
  vaccine-medicinal-product.json\
  vaccine-prophylaxis.json\
"

for vs in $valueSets; do
  curl "https://raw.githubusercontent.com/ehn-dcc-development/ehn-dcc-valuesets/main/$vs" > $vs
done

jq --slurp 'map( { (.valueSetId): .valueSetValues|keys }) | add' $valueSets > valueSets.json

for vs in $valueSets; do
  rm $vs
done

echo "Compressed value sets."

