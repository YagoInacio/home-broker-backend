FROM node:lts-alpine

WORKDIR /home/node/app

USER node

CMD ["tail", "-f", "/dev/null"]
