#!/usr/bin/env bash

rm -fr dist
mkdir dist
cp -r avatar dist/avatar
cp -r favicon dist/favicon
mogrify -resize x255 dist/avatar/*
mogrify -resize x64 dist/favicon/*
aws --profile server-side-slinger s3 sync dist s3://server-side-slinger-public/img --acl public-read --exclude .DS_Store