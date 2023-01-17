import Card from "../models/card.js"
import Command from "../models/command.js";
import { getDateString } from "../../utilities/timeUtilities.js"
import { gql, UserInputError } from "apollo-server";
import { getPopulatedUser } from "../../controllers/userController.js";
import { getPopulatedCommand, useCards } from "../../controllers/commandController.js";

export const commandTypes = gql`
  type Command {
    id: ID!
    userId: String!
    username: String!
    obtainDate: String!
    card: Card!
    quantity: Int!
    result: String!
  }

  extend type Query {
    allCommands: [Command]!
    userCommands(userId: String): [Command]!
  }

  extend type Mutation {
    createCommand(userId: String!, cardId: String!, fragments: Int!): Command
    activateCommand(commandId: String!): String
  }
`;

export const commandResolvers = {
  Query: {
    allCommands: async () => await getPopulatedCommand(),
    userCommands: async (root, args) => {
      return await getPopulatedCommand(args.userId)
    }
  },
  Mutation: {
    createCommand: async (root, args) => {
      let user
      try{
        user = await getPopulatedUser(args.userId)
        if(!user) return UserInputError('Usuario no encontrado')
      } catch (error){
        return new UserInputError('El identificador del usuario no cumple el formato utilizado')
      }

      let card
      try{
        card = await Card.findById(args.cardId).populate('game')
        if(!card) return UserInputError('Carta no encontrada')
      } catch (error){
        return new UserInputError('El identificador de la Carta no cumple el formato utilizado')
      }

      let {quantity, result } = await useCards(user, card, args.fragments)
      
      const command = new Command({ 
        userId: user.id,
        username: user.username,
        obtainDate: getDateString(),
        card: card,
        quantity,
        result
      });
      
      return command.save();
    },
  },
};
