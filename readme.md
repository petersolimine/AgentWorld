# 🤖 AgentWorld 🌎

## What is it?

AgentWorld is a unique game/simulation environment, underpinned by a language model acting as the game engine. This project was born from our curiosity about what it would take to create such a system.

We sought to make it extremely simple for anyone to set up their own language-based games. This repository is the result of that effort. 

AgentWorld is unique in that the game engine itself is a language model. This model maintains the state of the virtual environment, embedding, retrieving, and modifying the state as per the actions of the players.

Agents (or humans) can interact inside the virtual world via text, prompted by the game engine.

*Note*: The terms `players`, `agents`, and `characters` are used interchangeably throughout this documentation, as are `game`, `simulation`, and `server`. 

## How does it work?

Before the game begins, the "World State" is written in json format (see: `server/src/prompts.ts`). This includes initial
'places & things' that exist in the world. 

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
3. Update or add to the state of the world in Chroma using OpenAI functions (see: `server/lib/StateManager`)

The server will then repeat the process for the next agent.

## Getting Started

There are three ways to set up this repository:
1. Run an entire local environment, with agents and a server
2. Run a local server, and allow others to connect to it
3. Run an agent, and connect to a remote server

- Node.js installed locally
- docker installed


### 1. Run an entire local environment, with agents and a server

#### Requirements
- Node.js installed locally
- docker installed

#### Steps
1. Clone this repository
2. `cd` into the repository
3. type `cp .env.example .env` and add your OpenAI API key to `.env`
4. type `docker-compose up --build` to start the server and sample agents
5. Navigate to `http://localhost:3000` to follow along

If you want to create a custom world with custom characters, you can edit `server/src/prompts.ts` and restart the server.

### 2. Run a local server, and allow others to connect to it
#### Requirements
- Node.js installed
- ngrok installed

#### Steps
1. Clone this repository 
      - in a terminal, type `git clone https://github.com/petersolimine/AgentWorld.git`
2. `cd` into the `server` directory 
      - type `cd AgentWorld/server`
3. Add your OpenAI API Key 
      - type `cp .env.example .env` and add your OpenAI API key to the newly created `.env` file
4. Edit the `WorldState` variable inside of `server/src/prompts.ts` to your liking
      - This is optional, but it's how you can customize the virtual world
5. Run `npm install` and then `npm start`
      - This will start the server on port 3123. You can change this value in `server/lib/constants.ts` if necessary.
6. Open a _new_ terminal, run `ngrok http 3123`, and copy the ngrok URL
      - It will look something like this: `https://9d06-104-7-12-69.ngrok-free.app`
7. Share the URL with your friends, and have them follow the steps in the next section!

#### UI View
If you want to follow along with the game, you can open a new terminal and navigate to the `frontend` directory,
then run `npm install` and `npm run dev`. This will start a local nextjs app on port 3000 that will show you
the current state of the world, and the actions that have been taken by each agent.

### 3. Run an agent, and connect to a remote server
#### Requirements
- Node.js installed

#### Steps
1. Clone this repository
2. `cd` into the repository, and then `cd agent`
3. run `npm install` and then `npm start`
4. When prompted, enter your character's name, and the URL of the server you want to connect to


---
### Boring stuff to ignore:

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
- [ ] Create an interesting long-form piece of content about this project (youtube video)
- [ ] Create a hook short-form piece of content about this project (tweet thread)

Backend:

- [ ] Make agents smarter (add thought, action, say, etc)
- [ ] Make the agent view in the terminal more interesting to watch
- [x] Make it easier to change the initial setup of the world
- [ ] Add aditional world examples (lord of the flies ?) (a vast emptiness)
- [ ] When character leaves game (dies) create an explanation
- [ ] Create a hosted version
- [ ] Theoretically, all agents and all world state could be generated and embedded from a single prompt (or sequence of prompts)

Bugs:
- [x] Code sometimes hangs during openai function calls

Backlog:
- [ ] when composing an action prompt, first have a model check if something is relevant or not
- [ ] Try to be more explicit about include information about the current _location_ of every action that is taken
