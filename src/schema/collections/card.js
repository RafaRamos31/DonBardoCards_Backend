import Card from "../models/card.js";
import Game from "../models/game.js";
import { gql, UserInputError } from "apollo-server";
import { findCards } from "../../controllers/cardController.js";
import { getDateString } from "../../utilities/timeUtilities.js";
import { getDefaultGame } from "../../controllers/gameController.js";

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

  type Stackable {
    timeEffect: Boolean!
    secondsEffect: Int
  }

  type Cooldown {
    secondsCooldown: Int!
    addStackCooldown: Boolean!
    stackSecondsApport: Int
    cooldownFinishAt: String!
  }

  type Card {
    id: ID!
    name: String!
    game: Game!
    rarity: Rarity!
    fragments: Int!
    command: String!
    limited: Limited
    stackable: Stackable
    cooldown: Cooldown
  }

  extend type Query {
    allCards: [Card]!
    findCards(gameId: String, rarity: Rarity, query: String): [Card]!
  }

  extend type Mutation {
    createCard(
      name: String!
      gameId: ID
      rarity: Rarity!
      fragments: Int!
      command: String!
      existences: Int
      timeEffect: Boolean
      secondsEffect: Int
      secondsCooldown: Int
      addStackCooldown: Boolean
      stackSecondsApport: Int
    ): Card
  }
`;

export const cardResolvers = {
  Query: {
    allCards: async () => Card.find({}).populate("game"),
    findCards: async (root, args) =>
      await findCards(args.gameId, args.rarity, args.query),
  },
  Mutation: {
    createCard: async (root, args) => {
      let game;
      if(args.gameId != null){
        try {
          game = await Game.findById(args.gameId);
          if (!game) return UserInputError("Juego no encontrado");
        } catch (error) {
          return new UserInputError(
            "El identificador del juego no cumple el formato utilizado"
          );
        }
      }
      else{
        game = await getDefaultGame()
      }

      const card = new Card({
        name: args.name,
        game: game,
        rarity: args.rarity,
        fragments: args.fragments,
        command: args.command,
        limited: handleLimited(args.existences),
        stackable: handleStackable(args.timeEffect, args.secondsEffect),
        cooldown: handleCooldown(
          args.secondsCooldown,
          args.addStackCooldown,
          args.stackSecondsApport
        ),
      });
      return card.save();
    },
  },
};

function handleLimited(existences) {
  if (existences) {
    return {
      existences,
    };
  }
  return null;
}

function handleStackable(timeEffect, secondsEffect) {
  if (timeEffect) {
    return {
      timeEffect,
      secondsEffect,
    };
  }
  return null;
}

function handleCooldown(
  secondsCooldown,
  addStackCooldown,
  stackSecondsApport
) {
  if (
    secondsCooldown != null &&
    addStackCooldown != null
  ) {
    return {
      secondsCooldown,
      addStackCooldown,
      stackSecondsApport,
      cooldownFinishAt: getDateString(),
    };
  }
  return null;
}
