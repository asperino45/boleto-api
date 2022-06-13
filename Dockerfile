FROM node:gallium-alpine as dev

RUN set -x

# Install base packages
RUN apk update &&\
    apk upgrade &&\
    apk add ca-certificates && update-ca-certificates &&\
    # Change TimeZone
   apk add --update tzdata

ENV TZ=America/Sao_Paulo

# Clean APK cache
RUN rm -rf /var/cache/apk/* &&\
    apk del tzdata

ADD --chown=node:node . /app

RUN chmod -R 0744 /app

USER node
WORKDIR /app

RUN yarn install \
    && yarn run build

CMD [ "yarn", "run", "start:dev" ]

FROM node:dubnium-alpine as prod
RUN set -x

# Install base packages
RUN apk update &&\
    apk upgrade &&\
    apk add ca-certificates && update-ca-certificates &&\
    # Change TimeZone
   apk add --update tzdata

ENV TZ=America/Sao_Paulo

# Clean APK cache
RUN rm -rf /var/cache/apk/* &&\
    apk del tzdata

COPY --from=dev --chown=node:node /app /app

RUN chmod -R 0744 /app
USER node
WORKDIR /app


    # rm -r node_modules && \
RUN rm -r src/ && \
    yarn install --production && \
    yarn cache clean

CMD [ "yarn", "run", "start:prod" ]

