import { gql } from "apollo-server";
import { getAllGames, createNewGame, updateGame, deleteGame, findGameById } from "../../controllers/gameController.js";

export const gameTypes = gql`
  type Game {
    id: ID!
    name: String!
    iconURL: String
  }

  extend type Query {
    allGames: [Game]!
    getGameById(gameId: String!): Game
  }

  extend type Mutation {
    createGame(name: String!, iconURL: String): Game
    updateGame(gameId: ID!, name: String, iconURL: String): Game
    deleteGame(gameId: ID!): Game
  }
`;

export const gameResolvers = {
  Query: {
    allGames: async () => getAllGames(),
    getGameById: async (root, args) => findGameById(args.gameId)
  },
  Mutation: {
    createGame: (root, args) => createNewGame(args.name, args.iconURL),
    updateGame: async (root, args) => updateGame(args.gameId, args.name, args.iconURL),
    deleteGame: async (root, args) => deleteGame(args.gameId)
  },
};
