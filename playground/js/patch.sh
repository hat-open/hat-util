#!/bin/sh

set -e

RUN_PATH=$(dirname "$(realpath "$0")")
PLAYGROUND_PATH=$RUN_PATH/..
. $PLAYGROUND_PATH/env.sh


(cd $RUN_PATH; npm install --silent --progress false)

exec node $RUN_PATH/patch.js "$@"
