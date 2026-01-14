FROM node:22.15.0 as base
WORKDIR /e-commerce
COPY package.json .
FROM base as dev
RUN npm i
COPY . .
CMD [ "npm" ,"run" , "start:dev" ]

FROM base as prod
RUN npm i --only=production
COPY . .
CMD [ "npm" ,"run" , "start:prod" ]