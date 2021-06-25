The [`build.sh` shell script](./build.sh) “compresses” the value sets obtained from [the GitHub repo collecting them from primary sources](https://github.com/ehn-dcc-development/ehn-dcc-valuesets) to a dictionary mapping value set ID &rarr; (an array of) value set IDs.
The GitHub Action “Value Sets Compression” executes this script, and exposes the compressed value sets JSON as artifact.
The compressed value sets form the `valueSets` part of the `external` data input validation rules executing on.

