# 🤖 AgentWorld 🌎

## 🤔 What is it?

AgentWorld is a unique game/simulation environment, underpinned by a language model acting as the game engine. This project was born from our curiosity about what it would take to create such a system.

We sought to make it extremely simple for anyone to set up their own language-based games. This repository is the result of that effort. 

AgentWorld is unique in that the game engine itself is a language model. This model maintains the state of the virtual environment, embedding, retrieving, and modifying the state as per the actions of the players.

Agents (or humans) can interact inside the virtual world via text, prompted by the game engine.

*Note*: The terms `players`, `agents`, and `characters` are used interchangeably throughout this documentation, as are `game`, `simulation`, and `server`. 

## 🛠️ How does it work?

Before the game begins, the "World State" is written in json format (see: `server/src/prompts.ts`). This includes initial 'places & things' that exist in the world. 

At the start of a game, the server embeds the entire world state in a vector database (a ChromaDB collection called `world`). The game starts once two agents have joined the server.

To join the game, agents make a post request to the game server with their Character's Name, and a postback URL to their server. The game server will make a post request to the provided URL on each turn.

The server then requests actions from each agent in a turn-based, round-robin fashion.

For each agent, the server generates a 'narration' of the current state of the world, and sends it to the agent. 

The narration is dynamically generated on each turn. To create the narration, the game engine considers three things:
1. The previous action taken by the agent (if applicable)
2. All actions that have occurred since the last time this agent took an action (if applicable)
3. Relevant information about the current state of the world, fetched from Chroma via semantic search

The narration is sent to the agent's server as a post request. The agent then has 30 seconds to respond with their next action.

When the response is received, the server will:
1. Store the action in the `actions` collection in Chroma and the `actions` array in the server
2. Query Chroma (`world` collection) for relevant items, locations, etc that may have been affected by the action
3. Update or add to the state of the world in Chroma using [OpenAI Functions](https://openai.com/blog/function-calling-and-other-api-updates) (implementation can be found in `server/lib/StateManager`)

The server will then repeat the process for the next agent.

## ⚡ Getting Started

There are three ways to set up this repository:
1. Run an entire local environment, with agents and a server
2. Run a local server, and allow others to connect to it
3. Run an agent, and connect to a remote server

- Node.js installed locally
- docker installed


### 1. Run an entire local environment, with agents and a server 🤖-🌎-🤖

#### Requirements
- Node.js installed locally
- docker installed

#### Steps
1. Clone this repository
2. `cd` into the repository
3. type `cp .env.example .env` and add your OpenAI API key to the newly created `.env` file
4. type `docker-compose up --build` to start the server and sample agents (having issues? upgrade docker-compose to v2.12.1)
5. Navigate to `http://localhost:3000` to follow along

If you want to create a custom world with custom characters, you can edit `server/src/prompts.ts` and restart the server.

### 2. Run a local server, and allow others to connect to it →🌎←
#### Requirements
- Node.js installed
- ngrok installed
- Docker installed

#### Steps
1. Clone this repository 
      - in a terminal, type `git clone https://github.com/petersolimine/AgentWorld.git`
2. `cd` into the directory 
      - type `cd AgentWorld`
3. Add your OpenAI API Key 
      - type `cp .env.example .env` and add your OpenAI API key to the newly created `.env` file
4. Edit the `WorldState` JSON object inside of `server/src/prompts.ts` to your liking
      - This is optional, but it's how you can customize the virtual world
5. Start a ChromaDB instance in Docker
      - Run `docker-compose -f docker-compose.chroma.yaml up --build -d`
6. Run `npm install` and then `npm start`
      - This will start the server on port 3123. You can change this value in `server/lib/constants.ts` if necessary.
7. Open a _new_ terminal, run `ngrok http 3123`, and copy the ngrok URL
      - It will look something like this: `https://9d06-104-7-12-69.ngrok-free.app`
8. Share the URL with your friends, and have them follow the steps in the next section!

#### UI View
If you want to follow along with the game, you can open a new terminal and navigate to the `frontend` directory,
then run `npm install` and `npm run dev`. This will start a local nextjs app on `http://localhost:3000` that will show you the actions of the game engine and the actions of each agent.

If you are _not_ running the server but want to view the frontend, edit `server/.env` with the server url :8080, run `npm i`, and then `npm run dev`.

### 3. Run an agent, and connect to a remote server 🤖→
There are three ways to do this. You can either 
1. Run the sample agent written in node.js, which requires nodejs _and_ Docker to be installed
2. Run the sample agent written in python, which _only_ requires python to be installed
3. Write your own agent in any language, following the spec, and connect to the server

These sections will be outlined below as _3.1_, _3.2_, and _3.3_, respectively.

#### _3.1_ Run the sample agent written in node.js
#### _3.1_ Requirements
- Node.js installed
- Docker installed

#### _3.1_ Steps
1. Clone this repository
2. `cd` into the repository
      - type `cd AgentWorld` 
3. Add your OpenAI API Key 
      - type `cp .env.example .env` and add your OpenAI API key to the newly created `.env` file
4. Describe your agent by editing the content inside of this file: `agent/config.json`
      - Server URL: The URL of the server you want to connect to
      - Character Name: The name of your character
      - Character Description: A short description of your character (this will be used as the agent's System Prompt)
5. Start a ChromaDB instance in Docker (this is where your agent's memory 🧠 is stored)
      - type `docker-compose -f docker-compose.chroma.yaml up --build -d`
6. Install necessary packages and start the agent
      -  type `npm install` and then `npm run agent`
7. (optional) Follow along with the gameplay (the stuff that your agent _can't_ see)
      - open a _new_ terminal, navigate to the directory (type `cd AgentWorld`) and then type `npm run view`

#### _3.2_ Run the sample agent written in python
TODO
#### _3.2_ Requirements
TODO
#### _3.2_ Steps
TODO

#### _3.3_ Run the sample agent written in node.js
You can write your agent in any language, as long as it follows the spec outlined below.
You could also build a client that prompts you for text input, so that you can play the game yourself.

#### _3.3_ Requirements
N/A, make your own rules. But use [Chroma](https://trychroma.com) for your agent's memory if you are based and AGI pilled.

#### _3.3_ Steps
- Set up an agent and establish a connection with the server.
- To connect, make a POST request to the server's `/join/` endpoint, including a JSON object with:
      - name: Your agent's name
      - url: Your agent's server URL

- Your agent's server should accept POST requests at the `/chat/` endpoint.
- When the game server makes a POST request to `/chat/` with `actionRequest` in the body, your server should respond with a JSON object containing:
      - `action`: The response of your agent, which will be treated as the agent's action.

For an example of this, see the implementation in `agent/index.ts`

---
### 📌 Boring stuff to ignore:

TODO: It would be interesting to add some end state, some way for the game to come to a conclusion.
This could be done with fucntions as well, when a user performs the right action, for example.

As of right now, the server will always use as much world state information as possible, reducing the size as
per context window limitations. In the future, it might be interesting to see how the game changes when less information
is included.

OTHER TODOS:

- [x] Server update chroma inside the updateDatabase function
- [x] Add new items and locations to Chroma when they are 'created' by players
- [x] Provide some world state information on game start (first action). In other words, fetch world state before prompting user to make an action
- [x] Update UI to display server actions separately from agent dialogue
- [x] Make UI less shitty

Frontend:
- [ ] Fix ordering of elements on frontend in terminal (animate with JS not CSS)
- [ ] Add a way to see/query/interact with the world state (items, locations, etc) in the UI

Other:

- [x] Clean up readme
- [x] Include Docker setup when running server-only or agent-only
- [x] and ngrok ^ (need agent to be able to connect to server) (wait for postback url to get from ngrok)
- [ ] Create an interesting long-form piece of content about this project (youtube video)
- [ ] Create a hook short-form piece of content about this project (tweet thread)

Backend:

- [ ] Make agents smarter (add thought, action, say, etc)
- [x] Make the agent view in the terminal more interesting to watch
- [x] Make it easier to change the initial setup of the world
- [ ] Add aditional world examples (lord of the flies ?) (a vast emptiness)
- [ ] When character leaves game (dies) create an explanation
- [ ] Create a hosted version
- [ ] Theoretically, all agents and all world state could be generated and embedded from a single prompt (or sequence of prompts)

Bugs:
- [x] Code sometimes hangs during openai function calls
- [x] The server_url for the frontend needs to be changed to the correct URL

Backlog:
- [ ] Create a win condition (in prompts.ts) and win check (classifier) after each turn
- [ ] when composing an action prompt, first have a model check if something is relevant or not
- [ ] Try to be more explicit about include information about the current _location_ of every action that is taken
