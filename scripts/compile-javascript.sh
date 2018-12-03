#!/bin/bash
set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
ROOT="${DIR}/.."
DIST_DIR="${ROOT}/dist"

echo "compile JS to NW binary format..."

$ROOT/node_modules/nw/nwjs/nwjc $DIST_DIR/app.js $DIST_DIR/app.bin;
rm -rf $DIST_DIR/app.js;