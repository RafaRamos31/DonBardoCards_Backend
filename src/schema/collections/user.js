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
`;

export const userResolvers = {

};
