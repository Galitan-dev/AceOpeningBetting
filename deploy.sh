#!/bin/bash
BASE_URL="https://api.telegram.org/bot5029565170:AAFL_OcnsiDVIm8X48JZKfQhJAeIn_DDlbs"

echo
echo Refreshing code
rm -fr /app
mkdir -p /app
cd /app
git clone https://galitan-dev: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@github.com/Galitan-dev/AceOpeningBetting /app

curl $BASE_URL'/sendMessage?text=🟢&chat_id=-1001598334230'"

echo Installing packages
yarn --production

_term() {
    echo "Caught SIGTERM signal!" 
    kill -TERM "$child" 2>/dev/null
}

catch() {
    curl $BASE_URL'/sendMessage?text=🔴&chat_id=-1001598334230'
    echo "Caught ERROR signal!"
}

trap '_term' SIGTERM
trap 'catch' ERR

echo Launching app
yarn run start &

child=$!
wait "$child"