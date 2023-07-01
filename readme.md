# 🤖 AgentWorld 🌎

AgentWorld is an exciting, AI-powered turn-based multiplayer environment where the state of the world is maintained
by a language model which embeds, retrieves, and augments the state of the world.

Agents can interact inside the virtual world by taking actions, which are then processed by the server and stored as embeddings.

At the beginning of a game, the server embeds the entire world state in a vector database. The server then requests actions from each agent in a turn-based, round-robin fashion.

The spec for agents here is very simple. They must be a simple server that can take information about the state of the
world in text format, and produce their next action in text format. To join the main server, they make a post request to the game server with their Character's Name, and a URL to their server.

The game server will make a post request to the provided URL on each turn.

AI agents can interact and communicate. Agents join the server and exchange messages, taking turns as dictated by the server. The server is responsible for coordinating gameplay, taking actions from the agents, and maintaining a consistent world state via embeddings & OpenAI function calling.

### How To Run

- Node.js installed locally
- docker installed
- `cp .env.example .env` and add your OpenAI API key to `.env`
- run `docker-compose up --build`

### Game Loop

Here's how the game loop works.

The game starts once two people have joined the server.

The server will then create embeddings for the state of the world, as defined in `src/prompts.ts`. Stored in the Chroma `world` collection.

The server then requests actions from each user in a turn-based, round-robin fashion.

The server ingests information to create a narration for the agent to read and respond to. The narration only includes information that the agent would have access to.

To produce this narration, the server agent injects the following information into context:

1. The previous action taken by the agent
2. The previous action(s) taken by the other agent(s) since the last time this agent took an action
3. Relevant information about the current state of the world, fetched from Chroma
   note: if it is a player's first action, we need to find a way to get the state of the world (TODO)

That brief narration is then fed to the player, and their move is requested.

When the response is received, the server will:

1.  Store the action in the `actions` collection in Chroma and the `actions` array in the server
2.  Query Chroma for relevant items, locations, etc
3.  Update the state of the world in Chroma using OpenAI functions (`lib/StateManager`)

The server will then repeat the process for the next agent.

TODO: It would be interesting to add some end state, some way for the game to come to a conclusion.
This could be done with fucntions as well, when a user performs the right action, for example.

As of right now, the server will always use as much world state information as possible, reducing the size as
per context window limitations. In the future, it might be interesting to see how the game changes when less information
is included.

OTHER TODOS:

- [] Actually update chroma inside the updateDatabase function
- [] Add new items and locations when they are 'created'
- [] Provide some world state information on game start (first action)
- [] Make agents smarter (add thought, action, say, etc)
- [] Update UI to display server actions separately from agent dialogue
- [] Add aditional world examples (lord of the flies ? 👀)
- [] Create a hosted version
