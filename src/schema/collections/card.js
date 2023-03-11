import { gql } from "apollo-server";
import { createNewCard, deleteCard, findCards, getAllCards, updateCard, useCards, findCardById } from "../../controllers/cardController.js";

export const cardTypes = gql`
  enum Rarity {
    COMMON
    RARE
    EPIC
    LEGENDARY
    UNIQUE
  }

  type Limited {
    existences: Int!
  }

  type Cooldown {
    cooldownFinishAt: String!
    secondsCooldown: Int!
    secondsAfterStack: Int
  }

  type Card {
    id: ID!
    name: String!
    imageURL: String
    description: String
    game: Game
    rarity: Rarity!
    fragments: Int!
    command: String!
    stackable: Boolean!
    secondsEffect: Int
    limited: Limited
    cooldown: Cooldown
  }

  extend type Query {
    allCards: [Card]!
    getCardById(cardId: String!): Card 
    findCards(gameId: String, rarity: Rarity, query: String): [Card]!
  }

  extend type Mutation {
    createCard(
      name: String!
      imageURL: String
      description: String
      gameId: ID
      rarity: Rarity!
      fragments: Int!
      command: String!
      stackable: Boolean!
      secondsEffect: Int
      existences: Int     
      secondsCooldown: Int
      secondsAfterStack: Int
    ): Card
    updateCard(
      cardId: ID!
      name: String
      imageURL: String
      description: String
      gameId: ID
      rarity: Rarity
      fragments: Int
      command: String
      stackable: Boolean
      secondsEffect: Int
      existences: Int     
      secondsCooldown: Int
      secondsAfterStack: Int
    ): Card
    deleteCard(cardId: ID!): Card
    useCards(userId: String!, cardId: String!, fragments: Int!): String!
  }
`;

export const cardResolvers = {
  Query: {
    allCards: async () => getAllCards(),
    getCardById: async (root, args) => findCardById(args.cardId),
    findCards: async (root, args) => findCards(args.gameId, args.rarity, args.query),
  },
  Mutation: {
    createCard: async (root, args) => createNewCard({...args}),
    updateCard: async (root, args) => updateCard({...args}),
    deleteCard: async (root, args) => deleteCard(args.cardId),
    useCards: async (root, args) => useCards(args.userId, args.cardId, args.fragments),
  }
};
