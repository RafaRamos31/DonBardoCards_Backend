import Card from "../models/card.js";
import Game from "../models/game.js";
import { gql, UserInputError } from "apollo-server";
import { findCards } from "../../controllers/cardsController.js";

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
      gameId: ID!
      rarity: Rarity!
      fragments: Int!
      existences: Int
      timeEffect: Boolean
      secondsEffect: Int
      secondsCooldown: Int
      addStackCooldown: Boolean
      stackSecondsApport: Int
      cooldownFinishAt: String
    ): Card
  }
`;

export const cardResolvers = {
  Query: {
    allCards: async () => Card.find({}).populate('game'),
    findCards: async (root, args) => await findCards(args.gameId, args.rarity, args.query)
  },
  Mutation: {
    createCard: async (root, args) => {
      let game
      try{
        game = await Game.findById(args.gameId)
        if(!game) return UserInputError('Juego no encontrado')
      } catch (error){
        return new UserInputError('El identificador del juego no cumple el formato utilizado')
      }

      const card = new Card({ 
        name: args.name,
        game: game,
        rarity: args.rarity,
        fragments: args.fragments,
        limited: handleLimited(args.existences),
        stackable: handleStackable(args.timeEffect, args.secondsEffect),
        cooldown: handleCooldown(
          args.secondsCooldown, args.addStackCooldown, args.stackSecondsApport, args.cooldownFinishAt
        )
      });
      return card.save();
    },
  },
};

function handleLimited(existences){
  if(existences){
    return {
      existences
    }
  }
  return null
}

function handleStackable(timeEffect, secondsEffect){
  if(timeEffect){
    return {
      timeEffect,
      secondsEffect
    }
  }
  return null
}

function handleCooldown(secondsCooldown, addStackCooldown, stackSecondsApport, cooldownFinishAt){
  if(secondsCooldown != null && addStackCooldown !=null && cooldownFinishAt !=null){
    return {
      secondsCooldown,
      addStackCooldown,
      stackSecondsApport,
      cooldownFinishAt
    }
  }
  return null
}

