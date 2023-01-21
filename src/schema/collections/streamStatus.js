import { gql } from "apollo-server";
import { editStatus, getCurrentStatus, toggleStatus } from "../../controllers/statusController.js";

export const streamTypes = gql`
  type RarityWeight {
    cardType: Rarity!
    weight: Int!
  }

  input RarityWeightInput {
    cardType: Rarity!
    weight: Int!
  }
  
  type StreamStatus {
    ref: Int!
    isActive: Boolean!
    currentGame: Game
    giftLootbag: LootBag
    appUsername: String!
    appUserPassword: String!
    appDefaultGameName: String!
    rarityWeights: [RarityWeight]!
  }

  extend type Query {
    getStatus: StreamStatus!
  }

  extend type Mutation {
    toggleStatus: StreamStatus!
    editStatus(
      isActive: Boolean!,
      currentGameId: String
      giftLootbagId: String
      appUsername: String!
      appUserPassword: String!
      appDefaultGameName: String!
      rarityWeights: [RarityWeightInput]!
    ): StreamStatus!
  }
`;

export const streamResolvers = {
  Query: {
    getStatus: async () => getCurrentStatus(),
  },
  Mutation: {
    toggleStatus: async (root, args) => toggleStatus(),
    editStatus: async (root, args) => editStatus({...args}),
  },
};
