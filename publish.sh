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
container="2049d58fd3bd9a6b068b8b6354d46752d713eb456df0e1b42ef76ac8e6edd8a9"
echo "Received token: $token"
echo

echo "Restarting container"
http POST "https://portainer.galitan.ml/api/endpoints/1/docker/containers/$container/restart" "Authorization: Bearer $token" | echo

echo "Loging out"
http POST "https://portainer.galitan.ml/api/auth/logout" "Authorization: Bearer $token" | echo

echo "DONE !"
