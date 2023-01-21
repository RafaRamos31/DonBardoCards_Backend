import express from "express";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageDisabled } from "apollo-server-core";
import "./db.js";
import { typeDefs, resolvers } from "./src/schema/schema.js";
import currentAuth from "./src/utilities/currentUser.js";
import { addRestDirections } from "./expressApi.js";
import { startTwitchBot } from "./twitchBot.js";

//Creates the Apollo Server with the GraphQL typeDefs and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: currentAuth,
  plugins: [ApolloServerPluginLandingPageDisabled()]
});

//Adding a Express Server for the required REST petitions
let app = express();
await server.start();
server.applyMiddleware({ app });

//Adding the REST petitions
app = addRestDirections(app)
app.listen({ port: 4000 });

//Turning on the Twitch bot
startTwitchBot()