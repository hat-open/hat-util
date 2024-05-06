#!/bin/sh

RUN_PATH=$(dirname "$(realpath "$0")")
PLAYGROUND_PATH=$RUN_PATH/..
. $PLAYGROUND_PATH/env.sh

exec node $RUN_PATH/patch.js "$@"
