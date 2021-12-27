FROM tarampampam/node:16-alpine

LABEL name="ace-betting-bot"
LABEL version="1.0"

ENV TOKEN="5029565170:AAFL_OcnsiDVIm8X48JZKfQhJAeIn_DDlbs"

COPY --from=tarampampam/curl:7.78.0 /bin/curl /bin/curl

RUN curl -H 'Authorization: token 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' -H 'Accept: application/vnd.github.v3.raw' -o /run/deploy.sh -L https://api.github.com/repos/galitan-dev/AceOpeningBetting/contents/deploy.sh
RUN ["cat", "/run/deploy.sh"]
RUN ["chmod", "+x", "/run/deploy.sh"]

ENTRYPOINT [ "/run/deploy.sh" ]
CMD [ "" ]
