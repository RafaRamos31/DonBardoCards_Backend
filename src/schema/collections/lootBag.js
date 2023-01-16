import LootBag from "../models/lootBag.js";
import Game from "../models/game.js";
import { gql, UserInputError } from "apollo-server";

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
    channelPoints: Int
    bits: Int
  }

  extend type Query {
    allLootBags: [LootBag]!
  }

  extend type Mutation {
    addLootBag(
      name: String!
      description: String!
      totalCards: Int!
      fixedGameId: ID
      fixedCards: [FixedCardInput]
      channelPoints: Int
      bits: Int
    ): LootBag
  }
`;

export const lootBagResolvers = {
  Query: {
    allLootBags: async () => LootBag.find({}).populate("fixedGame"),
  },
  Mutation: {
    addLootBag: async (root, args) => {
      let fixedCards = null;

      let game;
      if (args.fixedGameId != null) {
        try {
          game = await Game.findById(args.fixedGameId);
          if (!game) return UserInputError("Juego no encontrado");
        } catch (error) {
          return new UserInputError(
            "El identificador del juego no cumple el formato utilizado"
          );
        }
      }

      if (args.fixedCards != null) {
        fixedCards = [];
        args.fixedCards.forEach((card) => {
          fixedCards = fixedCards.concat({
            cardType: card.cardType,
            quantity: card.quantity,
          });
        });
      }

      const lootBag = new LootBag({
        name: args.name,
        description: args.description,
        totalCards: args.totalCards,
        channelPoints: args.channelPoints,
        bits: args.bits,
        fixedGame: game,
        fixedCards: fixedCards,
      });
      return lootBag.save();
    },
  },
};
