FROM node:18-alpine AS build

WORKDIR /record-recorder

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine AS serve

RUN npm install -g serve

COPY --from=build /record-recorder/dist /record-recorder/dist

COPY serve.json /record-recorder/dist/serve.json

EXPOSE 3345

CMD ["serve", "-s", "/record-recorder/dist", "-l", "3345"]
