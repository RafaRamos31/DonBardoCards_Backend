import { gql } from "apollo-server";
import { gameTypes, gameResolvers } from "./collections/game.js";
import { userTypes, userResolvers } from "./collections/user.js";
import { authTypes, authResolvers } from "./collections/auth.js";
import { cardTypes, cardResolvers } from "./collections/card.js";
import { lootBagTypes, lootBagResolvers } from "./collections/lootBag.js";
import { streamTypes, streamResolvers } from "./collections/streamStatus.js";
import { rewardTypes, rewardResolvers } from "./collections/reward.js";
import { commandTypes, commandResolvers } from "./collections/command.js";

const rootTypeDefs = gql`
  type Query {
    _: String
  }

  type Mutation {
    _: String
  }
`;

export const typeDefs = [
    rootTypeDefs,
    gameTypes,
    userTypes,
    cardTypes,
    lootBagTypes,
    streamTypes,
    authTypes,
    rewardTypes,
    commandTypes
]

export const resolvers = [
    gameResolvers,
    userResolvers,
    cardResolvers,
    lootBagResolvers,
    streamResolvers,
    authResolvers,
    rewardResolvers,
    commandResolvers
]