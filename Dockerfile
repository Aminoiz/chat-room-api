FROM node:14 AS development

WORKDIR /amino/src/app

COPY package*.json ./

RUN npm install

RUN npm run build

EXPOSE 3000

################
## PRODUCTION ##
################
FROM node:14 AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /amino/src/app

COPY --from=development /amino/src/app/ .

EXPOSE 3000

# run app
CMD [ "node", "dist/main"]
