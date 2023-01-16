import Game from "../models/game.js";
import { gql } from "apollo-server";

export const gameTypes = gql`
  type Game {
    id: ID!
    name: String!
    iconURL: String
  }

  extend type Query {
    allGames: [Game]!
  }

  extend type Mutation {
    addGame(name: String!, iconURL: String): Game
  }
`;

export const gameResolvers = {
  Query: {
    allGames: async () => Game.find({}),
  },
  Mutation: {
    addGame: (root, args) => {
      const game = new Game({ ...args });
      return game.save();
    },
  },
};
