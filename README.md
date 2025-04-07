# Tron : The Successor

<p align=center>
    <span>Project realized by <a href="https://github.com/AlbanFALCOZ">Alban Falcoz</a>, <a href="https://github.com/06Games">Evan Galli</a> and <a href="https://github.com/Alexandre-Gripari">Gripari Alexandre</a>
    <br/>as part of the <b>PS8: Full Stack Developer</b> course.</span>
</p>

## Installation 

### Using Docker

The following steps require Git and Docker Compose.

1. Clone the repository
2. Copy the `.env.template` file to one named `.env`
3. Modify the configuration inside `.env`, especially the `JWT_SECRET`
4. Launch the services with `docker compose up -d`

### Manually

You'll need a working MongoDB installation to use this project.

1. Clone the repository using Git
2. Set the required environment variables (they are listed in the `.env.template` file)
3. Launch every service using `npm start`

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

In addition, a detailed match history — covering games played against online opponents, friends, and bots — exclusively reserved for you is available, so that you can replay each match step by step to review moves, learn from mistakes, and refine your strategy.

A leaderboard showcases the top 10 players, highlighting the highest-performing users in the game.

You can also view a rank distribution histogram, offering insights about how players are spread across the different ranks.
It's helpful for understanding your position in the global competitive landscape.

### Customization 

Personalize your experience by choosing from a selection of preset avatars and spaceships, along with your first and second choice colors.
Whether you want to stand out or match your style, customization options let you make the game feel more like your own.
