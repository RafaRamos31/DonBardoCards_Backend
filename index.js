import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core";
import "./db.js";
import { typeDefs, resolvers } from "./src/schema/schema.js";
import currentAuth from "./src/utilities/currentUser.js";
import { addRestDirections } from "./expressApi.js";
import { startTwitchBot } from "./twitchBot.js";

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: currentAuth,
  plugins: [ApolloServerPluginLandingPageDisabled()]
});

let app = express();
await server.start();
server.applyMiddleware({ app });

app = addRestDirections(app)
app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);

startTwitchBot()