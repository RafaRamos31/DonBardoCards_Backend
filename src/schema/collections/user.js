import { gql } from "apollo-server";
import { loginUser, registerUser } from "../../controllers/userController.js";

export const userTypes = gql`
  enum Status {
    ACTIVE
    HUSHED
    BANNED
  }
  
  type UserCard {
    card: Card!
    quantity: Int!
  }

  type UserStats {
    creationDate: String!
    favoriteCard: Card
    totalOpenings: Int!
    totalCardUses: Int!
    usedCards: [UserCard]!
  }

  type User {
    id: ID!
    username: String!
    passwordHash: String
    status: Status!
    stats: UserStats!
    cards: [UserCard]!
  }

  type Token {
    value: String!
  }

  extend type Query {
    me: User
  }

  extend type Mutation {
    register(username: String!, password: String!): User
    login(username: String!, password: String!): Token
  }
`;

export const userResolvers = {
  Query: {
    me: (root, args, context) => { return context.currentUser }     
  },
  Mutation: {
    register: async (root, args) => registerUser(args.username, args.password),
    login: async (root, args) => loginUser(args.username, args.password)
  },
};
