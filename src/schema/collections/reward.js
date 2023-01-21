import { gql} from "apollo-server";
import { claimReward, createNewReward, deleteReward, getAllRewards, getUserRewards } from "../../controllers/rewardController.js";

export const rewardTypes = gql`
  type RewardCard {
    card: Card!
    quantity: Int!
    new: Boolean!
  }

  type Reward {
    id: ID!
    purchaserID: String!
    purchaserName: String!
    obtainDate: String!
    lootBag: LootBag!
  }

  extend type Query {
    allRewards: [Reward]!
    userRewards(userId: String): [Reward]!
  }

  extend type Mutation {
    createReward(username: String!, lootBagId: String!): Reward
    claimReward(userId: String!, rewardId: String!): [RewardCard]
    deleteReward(rewardId: String!): Reward
  }
`;

export const rewardResolvers = {
  Query: {
    allRewards: async () => getAllRewards(),
    userRewards: async (root, args) => getUserRewards(args.userId)
  },
  Mutation: {
    createReward: async (root, args) => createNewReward(args.username, args.lootBagId),
    claimReward: async (root, args) => claimReward(args.userId, args.rewardId),
    deleteReward: async (root, args) => deleteReward(args.rewardId),
  },
};
