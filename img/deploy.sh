#!/usr/bin/env bash

rm -fr dist/*
cp -r avatar dist/avatar
cp -r favicon dist/favicon
mogrify -resize x255 dist/avatar/*
#mogrify -resize x255 dist/favicon/*
#aws --profile personal s3 sync dist s3://dashmobile-deploy/dist