# Tron : The Successor

<p align=center>
    <img src="services/files/front/assets/spaceships/3.svg" width="20%" alt="Spaceship" /><br />
    <span>Project realized by <a href="https://github.com/AlbanFALCOZ">Alban Falcoz</a>, <a href="https://github.com/06Games">Evan Galli</a> and <a href="https://github.com/Alexandre-Gripari">Gripari Alexandre</a>
    <br/>as part of the <b>PS8: Full Stack Developer</b> course.</span>
</p>

## Installation

### Web

#### Using Docker

The following steps require Git and Docker Compose.

1. Clone the repository
2. Copy the `.env.template` file to one named `.env`
3. Modify the configuration inside `.env`, especially the `JWT_SECRET`
4. Launch the services with `docker compose up -d`
5. Visit the front-end at `http://localhost:8000` (or the port you specified in the `.env` file)

#### Manually

You'll need a working MongoDB installation to use this project.

1. Clone the repository using Git
2. Set the required environment variables (they are listed in the `.env.template` file)
3. Launch every service using `npm start`
4. Visit the front-end at `http://localhost:8000` (or the port you specified in the `.env` file)

### Android

With the Android environment setup, you can run the following commands to build and run the Android app:

```shell
cd services/files/front
npx gulp
npx cap run android
```

### iOS

On MacOS with XCode 15+ and XCode Command Line Tools installed, you can run the following script to build the unsigned iOS app:

```shell
./setup-ios.sh
```

Then you can use something like [AltStore](https://altstore.io/) to install it on your iOS device.

## Features

### Accounts

Players can register and log in using a secure account system.
During registration, you’ll choose from a large variety of security questions to help with password recovery in case you forget your credentials.

The platform also uses a token-based system to keep you logged in between sessions, so you don’t have to re-enter your information every time you open the game.

### Game

The game currently features a single 1v1 round mode played on a 16 by 9 grid.

You can enjoy this mode through several different ways of playing:

* Local Match: Play with a friend on the same computer.
  * Player 1 uses ZQSD to move
  * Player 2 uses the arrow keys
* Against the Bot: Challenge FlowBird, our AI opponent.
* Online Ranked Match: Once logged in you can check how many players are online globally and compete against them in real time to climb the leaderboard.
* Online Friendly Match: Invite a friend for a private game online.

### Ranking

Tron Points (TP) are the measure of your progress in the ranked system.
You need 100 TP to reach the next tier or rank.
TP is earned through victories and lost through defeats.

You can climb up the following ranks: Line, Triangle, Square, Pentagon, Hexagon.
Each division (except Hexagon) has three tiers: III, II, and I.
You'll start at tier III of each division and work your way up to tier I before advancing to the next division.

Hexagon is the highest rank, with no upper limit, reserved for the most elite players..

### Social

#### Friends

You can add other players as friends to stay connected.
Once added, you’ll be able to see their online status, and quickly invite them to matches or chat privately.
It’s a simple way to keep up with your favorite opponents and teammates.
Chats with unread messages are subtly highlighted and moved to the top, so you’ll never miss a conversation.

#### Chats

The game includes three types of chat interactions to keep communication dynamic and engaging:

* a global chat for connecting with the wider community ;
* private chats with friends for direct conversations ;
* and in-game emotes to quickly express yourself during matches.

### Performance Overview

Some statistics are publicly visible, such as the win rate, the number of hours and games played, the current win streak and your rank.

In addition, a detailed match history — covering games played against online opponents, friends, and bots — exclusively reserved for you is available, so that you can
replay each match step by step to review moves, learn from mistakes, and refine your strategy.

A leaderboard showcases the top 10 players, highlighting the highest-performing users in the game.

You can also view a rank distribution histogram, offering insights about how players are spread across the different ranks.
It's helpful for understanding your position in the global competitive landscape.

### Customization

Personalize your experience by choosing from a selection of preset avatars and spaceships, along with your first and second choice colors.
Whether you want to stand out or match your style, customization options let you make the game feel more like your own.

## Architecture

### Micro-services

Our project is broken down into several services, and we will describe their roles below.

#### Gateway

The gateway service acts as a single point of entry for all incoming requests.  
It manages both HTTP and WebSocket communications, routing them to the appropriate micro-service according to the request URL or WebSocket namespace.  
Only the gateway is accessible from outside.  
All other micro-services are deployed within a private network and are not exposed to external clients.

#### Files

The file service serves the front-end.  
Since our website is a SPA (Single Page Application), it will redirect each request (other that the ones asking for assets) to the `index.html` page.  
The front-end is described in it's dedicated [read-me](services/files/README.md).

#### Game

The game service is responsible for handling the three types of online gameplay we offer: games against the computer, ranked games, and friend challenges.  
The Game micro-service is tasked with several key responsibilities.  
It oversees the creation and management of game sessions, ensuring that each game is properly initialized and that all participants are correctly registered.  
For games against the computer, the service manages the AI logic, ensuring that the computer opponent responds appropriately to player actions.  
In ranked games, the service handles matchmaking.  
Additionally, it tracks player rankings and updates them in real-time based on game outcomes.  
It also keeps track of player statistics such as win rate, win streaks, total number of games played, and maintains a detailed history of past matches.  
For friend challenges, the service verifies whether the invitation is still active (not expired or already accepted/rejected) and ensures that the recipient is the
intended user.

#### Chat

The chat micro-service is designed to facilitate real-time communication among users within our platform.  
This service uses WebSockets to deliver messages in real-time but it also stores them so that the various communications can later be retrieved.  
This service is responsible for managing two primary types of communication: global chat and private friend chat.

For global chat, the service broadcasts messages to all participants in a public room.  
It creates a sense of community, allows users to engage in discussions with a broader audience and can be useful to find people to play with.  
In private friend chat, the service facilitates one-on-one conversations between players.

The chat micro-service is also used for friend invitations and friend challenges.  
It handles their transmission, as special messages and are displayed differently in the UI.

By having an independent service for communication-related functionalities, we ensure a clear separation of concerns, making the system more modular and easier to
maintain.  
This architecture also enhances scalability, as the chat micro-service can be independently scaled to handle increased communication demands without affecting other
components of the platform.

#### User

The User Service is responsible for all account-related operations within the system.  
It handles user registration, allowing new players to create an account with secure credential storage.  
It also manages the login process, verifying user credentials and generating JWT access tokens for authenticated sessions.

Another key responsibility of this service is the management of each player’s friend list.  
Players can send, accept, or decline friend requests, and retrieve their current list of friends.  
By centralizing these operations within a single service, we ensured that all sensitive identity and relationship data remains isolated from other services, reducing
security risks and simplifying access control.

This breakdown made sense because account management, authentication, and player relationships are core identity services that naturally belong together.  
Keeping them in a dedicated microservice ensures clear separation of concerns, improved maintainability, and simplifies security enforcement.

#### Notification

This service is responsible for managing real-time notifications within the system.  
It establishes a dedicated one-to-one WebSocket connection with every connected player.  
This allows the system to instantly push relevant updates such as friend requests, game invitations.  
This design improves user experience by keeping clients immediately informed of important actions affecting their account, without requiring them to refresh or actively
poll for updates.

By isolating these responsibilities into a dedicated service, we ensured that real-time features remain performant and scalable without overloading other services like
the User Service or Game Service.  
It has also enabled us to adapt the distribution of events specifically to the notification use cases, which has made it easier to maintain and extend the system.

#### Inventory

The inventory micro-service manages the catalog of available personalisation items, ensuring that users have access to a variety of options for customizing their in-game
appearance.  
The service tracks user selections, allowing players to choose their preferred avatar, spaceship, and colour schemes, including both primary and secondary colour
choices (in case both player would have the same primary colour).

However, the current implementation of the inventory micro-service represents only a portion of its intended capabilities.  
The original vision included a shop feature where players could unlock additional personalisation items through in-game achievements, quests, or other means.

The decision to separate the inventory micro-service from other components of the platform was driven by the need for modularity and scalability.  
By isolating personalisation-related functionalities, we can more easily update and expand the inventory system without impacting other areas of the platform.

### Communications

In our architecture, service communication is split between HTTP and WebSocket based on the nature and timing of the data being exchanged.

HTTP is employed for stateless, request/response-based operations. This includes tasks such as user registration, login, password reset, retrieving inventory, and
accessing static game resources. In these cases, the client initiates a connection to the Gateway via HTTP, which then proxies the request to the appropriate
micro-service (e.g., user service, inventory service, file service). This approach is optimal for transactional operations where immediate and bidirectional
communication is not required.

Examples of HTTP-based exchanges:

* User registration, login, password reset: Client → Gateway → User Service

* Retrieve inventory: Client → Gateway → Inventory Service

WebSocket is used for real-time, event-driven communication where low latency is crucial. The client establishes a WebSocket connection to the Gateway at `/ws`,
specifying a namespace corresponding to the target service (e.g., `/api/game`, `/api/chat`, `/api/notification`) to which the gateway will open a new connection. This
allows the system to push instant updates such as
game status changes, chat messages, and notifications directly to clients without needing to refresh or poll for updates.

Examples of WebSocket-based exchanges:

* Game status updates: Server ↔ Client (e.g., new turn, player moves)

* Live chat messages: Client ↔ Server

There is also communication between services via HTTP requests to synchronize actions across the system. For instance:

* The user service communicates with the chat service to send friend requests and the chat service communicates with the user service to manage user-specific chat rooms
  and ensure that the players are friends : Client → Gateway -> User Service -> Chat Service

* The notification service receives HTTP requests from other services to trigger and send notifications to the client via the WebSocket connection : Client → Gateway ->
  User Service -> Notification Service -> Client (via websocket).

By combining HTTP for transactional operations and WebSocket for real-time communication, we ensure that each type of data exchange uses the most efficient and
appropriate protocol.  
