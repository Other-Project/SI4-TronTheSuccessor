FROM node:18-slim
USER node

ENV MONGO_DB_URL 'mongodb://mongodb:27017'

# mkdir and cd
WORKDIR /app

# copies package.json and package-lock.json
COPY --chown=node:node package*.json .

# installs dependencies
RUN npm install --omit=dev

# copies the service files
COPY --chown=node:node . .

# exposes the port the service is listening to
EXPOSE 8003

# start the service
CMD ["npm", "start"]