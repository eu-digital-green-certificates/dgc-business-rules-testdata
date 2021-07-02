#!/bin/sh

echo "Running the value sets build script..."
(cd valuesets ; ./build.sh)

echo "Running the tooling build script..."
(cd tooling ; ./build.sh)

