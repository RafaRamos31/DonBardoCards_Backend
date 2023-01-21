import { gql } from "apollo-server";
import { gameTypes, gameResolvers } from "./collections/game.js";
import { userTypes, userResolvers } from "./collections/user.js";
import { cardTypes, cardResolvers } from "./collections/card.js";
import { lootBagTypes, lootBagResolvers } from "./collections/lootBag.js";
import { streamTypes, streamResolvers } from "./collections/streamStatus.js";
import { rewardTypes, rewardResolvers } from "./collections/reward.js";

const rootTypeDefs = gql`
  type Query {
    _: String
  }

  type Mutation {
    _: String
  }
`;

/**
 * An array with the Type Definition of all the entities of the GraphQL Schema
 */
export const typeDefs = [
    rootTypeDefs,
    gameTypes,
    userTypes,
    cardTypes,
    lootBagTypes,
    streamTypes,
    rewardTypes
]

/**
 * An array with the Resolvers of all the entities of the GraphQL Schema
 */
export const resolvers = [
    gameResolvers,
    userResolvers,
    cardResolvers,
    lootBagResolvers,
    streamResolvers,
    rewardResolvers
]