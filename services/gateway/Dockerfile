FROM node:18-slim

ENV FILES_SERVICE_URL "http://172.0.0.1:8001"
ENV GAME_SERVICE_URL "http://172.0.0.1:8003"

USER node

# mkdir and cd
WORKDIR /app

# copies package.json and package-lock.json
COPY --chown=node:node package*.json .

# installs dependancies
RUN npm install --omit=dev

# copies the service files
COPY --chown=node:node . .

# exposes the ports the service is listening to
EXPOSE 8000
EXPOSE 8002

# start the service
CMD ["npm", "start"]
