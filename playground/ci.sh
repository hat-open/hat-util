#!/bin/sh

CI_GIT_REPO=${CI_GIT_REPO:-https://github.com/hat-open/hat-util.git}
CI_GIT_BRANCH=${CI_GIT_BRANCH:-master}
CI_IMAGE=docker.io/library/python:3.10-bullseye

podman run -i --rm $CI_IMAGE /bin/sh << EOF

set -e

mkdir -p /venv
python -m venv /venv
. /venv/bin/activate

mkdir -p /ci
cd /ci
git clone -q --depth 1 -b $CI_GIT_BRANCH $CI_GIT_REPO .

pip install -q -r requirements.pip.dev.txt

doit test

EOF
