import User from "../models/user.js";
import { hashPassword } from "../../utilities/registerUtilities.js";
import { gql, UserInputError } from "apollo-server";
import jwt from "jsonwebtoken";
import { createNewUser, getPopulatedUser } from "../../controllers/userController.js";

export const authTypes = gql`
  type Token {
    value: String!
  }

  extend type Query {
    me: User
    test(userId: String!): User
  }

  extend type Mutation {
    register(username: String!, password: String!): User
    login(username: String!, password: String!): Token
  }
`;

export const authResolvers = {
  Query: {
    me: (root, args, context) => {
      return context.currentUser;
    },
    test: async (root, args) => await getPopulatedUser(args.userId)
      
  },
  Mutation: {
    register: async (root, args) => {
      const existent = await User.findOne({ username: args.username });

      if (existent) {
        if(existent.passwordHash == null){
          existent.passwordHash = hashPassword(args.password)
          return existent.save()
        }
        else{
          throw new Error(
            "Esta cuenta de Twitch ya tiene un usuario registrado."
          );
        }
      }
      return createNewUser(args.username, args.password);
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || user.passwordHash != hashPassword(args.password)) {
        throw new UserInputError("Datos incorrectos.");
      }

      const userForToken = {
        username: user.username,
        id: user.id,
      };

      return {
        value: jwt.sign(userForToken, process.env.JWT_SECRET),
      };
    },
  },
};
