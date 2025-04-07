FROM node:18-slim
USER node

ENV MONGO_DB_URL 'mongodb://mongodb:27017'
ENV GAME_INVITATION_SECRET_KEY "4c6d80d9ca8be043da7d58c97fd9e62b24daa659c2ace0111c68bc640d3d39f1"

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
