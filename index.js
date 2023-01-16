import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core";
import "./db.js";
import { typeDefs, resolvers } from "./src/schema/schema.js";
import currentAuth from "./src/utilities/currentUser.js";
import { encrypt } from "./src/utilities/decoder.js";
import { createChatReward } from "./src/controllers/rewardController.js";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: currentAuth,
  plugins: [ApolloServerPluginLandingPageDisabled()]
});

const app = express();
await server.start();
server.applyMiddleware({ app });

app.get("/registerURL/:username", (request, response) => {
  const username = request.params.username;
  response
    .status(200)
    .send(
      `Utiliza el siguiente enlace para crear tu cuenta: donbardoapi.com/register/${encrypt(
        username
      )}`
    );
});



app.get("/freeLoot", async (request, response) =>  {
  let message = await createChatReward()
  response
    .status(200)
    .send(message);
});

app.get("/useCards", (request, response) => {
  response.status(200).send(`!command ${2}`);
});

app.get("/buyLootBag/:user-bagType", (request, response) => {
  response.status(200).send(`¡${1} ha comprado una ${2}!`);
});

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);
