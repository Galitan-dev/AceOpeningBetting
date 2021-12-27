#!/bin/bash

echo
echo Refreshing code
rm -fr /app
mkdir -p /app
cd /app
git clone https://galitan-dev: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@github.com/Galitan-dev/AceOpeningBetting /app

echo Installing packages
yarn --production

echo Launching app
yarn run start