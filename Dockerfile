# build stage
FROM node:latest as build-stage
RUN npm install -g yarn
WORKDIR /app
COPY package*.json ./
RUN yarn install
COPY . .
RUN yarn build

# production stage
FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
