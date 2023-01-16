import { gql } from "apollo-server";
import { getPopulatedUser } from "../../controllers/userController.js";

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
    favoriteCard: String
    totalOpenings: Int!
    totalCardUses: Int!
    usedCards: [UserCard]!
  }

  type User {
    id: ID!
    username: String!
    passwordHash: String!
    status: Status!
    stats: UserStats!
    cards: [UserCard]!
  }

  extend type Query {
    test(userId: ID!): User
  }

  #extend type Mutation {
  #  register(username: String!, password: String!): User
  #  login(username: String!, password: String!): Token
  #}
`;

export const userResolvers = {
  Query: {
    test: async (root, args) => getPopulatedUser(args.userId)
  },
};
