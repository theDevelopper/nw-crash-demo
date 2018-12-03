#!/bin/bash
set -e

VERSION="0.0"
CHANNEL="dev"
BUILD_NUMBER="0"
MODE="development"
COMMIT="nocommit"
DEBUG=1

while test "${1:0:1}" = "-"; do
  case $1 in
    --channel)
      CHANNEL="$2"
      shift; shift;;
	--build)
      BUILD_NUMBER="$2"
      shift; shift;;
    --commit)
      COMMIT="$2"
      shift; shift;;
  esac
done

if [ "$CHANNEL" == "beta" ] || [ "$CHANNEL" == "stable" ]
then
	MODE="production"
	DEBUG=0
fi

rm -rf ./dist;
mkdir -p ./dist/;
./node_modules/.bin/cross-env NODE_ENV=$MODE ./node_modules/.bin/webpack --config webpack.config.js --mode $MODE --env.channel=$CHANNEL --env.debug=$DEBUG --env.build=$BUILD_NUMBER --env.commit=$COMMIT