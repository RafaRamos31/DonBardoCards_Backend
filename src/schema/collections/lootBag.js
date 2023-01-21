import { gql } from "apollo-server";
import { createNewLootbag, deleteLootBag, getAllLootbags, updateLootbag } from "../../controllers/lootbagController.js";

export const lootBagTypes = gql`
  type FixedCard {
    cardType: Rarity!
    quantity: Int!
  }

  input FixedCardInput {
    cardType: Rarity!
    quantity: Int!
  }

  type LootBag {
    id: ID!
    name: String!
    description: String!
    totalCards: Int!
    fixedGame: Game
    fixedCards: [FixedCard]
    twitchCommand: String!
    channelPoints: Int
    bits: Int
  }

  extend type Query {
    allLootBags: [LootBag]!
  }

  extend type Mutation {
    createLootBag(
      name: String!
      description: String!
      totalCards: Int!
      fixedGameId: ID
      fixedCards: [FixedCardInput]
      channelPoints: Int
      bits: Int
    ): LootBag
    updateLootBag(
      id: ID!
      name: String
      description: String
      totalCards: Int
      fixedGameId: ID
      fixedCards: [FixedCardInput]
      channelPoints: Int
      bits: Int
    ): LootBag
    deleteLootBag(lootbagId: ID!): LootBag
  }
`;

export const lootBagResolvers = {
  Query: {
    allLootBags: async () => getAllLootbags(),
  },
  Mutation: {
    createLootBag: async (root, args) => createNewLootbag({...args}),
    updateLootBag: async (root, args) => updateLootbag({...args}),
    deleteLootBag: async (root, args) => deleteLootBag(args.lootbagId)
  },
};
