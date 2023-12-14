# build stage
FROM node:18.16.0-alpine as build-stage
ARG VITE_BASE_URL=${VITE_BASE_URL}
ARG VITE_VERIFICATION_CODE=${VITE_VERIFICATION_CODE}
WORKDIR /app
COPY package*.json ./
RUN npm install -g --force yarn
RUN yarn install
COPY . .
RUN yarn build

# production stage
FROM socialengine/nginx-spa:latest
COPY --from=build-stage /app/dist /app
RUN chmod -R 777 /app