FROM node:18-slim
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
