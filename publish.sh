#!/bin/bash

exa -lT --icons bin

echo
echo "Publishing to github"
git add -A
git status -s
git commit -m "$*" --quiet
git push --quiet

echo
echo "Restarting remote container"

echo "Authenticating"
token=$(https POST https://portainer.galitan.ml/api/auth Username="admin" Password="5fluWzi3uGD64m7B" | jq -r '.jwt')
container="864a3a6e386541791c568b21b3ffffa9408c8ca1fb3406a09a733fbfec124107"
echo "Received token: $token"
echo

echo "Restarting container"
http POST "https://portainer.galitan.ml/api/endpoints/1/docker/containers/$container/restart" "Authorization: Bearer $token" | echo

echo "Loging out"
http POST "https://portainer.galitan.ml/api/auth/logout" "Authorization: Bearer $token" | echo

echo "DONE !"
