import { gql, UserInputError } from "apollo-server";
import { claimReward, createReward, getPopulatedRewardById, getPopulatedRewards } from "../../controllers/rewardController.js";
import { getPopulatedUser } from "../../controllers/userController.js";

export const rewardTypes = gql`
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
    claimReward(userId: String!, rewardId: String!): [UserCard]
  }
`;

export const rewardResolvers = {
  Query: {
    allRewards: async () => getPopulatedRewards(),
    userRewards: async (root, args) => {
      return await getPopulatedRewards(args.userId)
    }
  },
  Mutation: {
    createReward: async (root, args) => { 
      return await createReward(args.username, args.lootBagId)
    },
    claimReward: async (root, args) => {
      let user
      try{
        user = await getPopulatedUser(args.userId)
        if(!user) return UserInputError('Usuario no encontrado')
      } catch (error){
        throw new UserInputError('El identificador del usuario no cumple el formato utilizado')
      }

      let reward
      try{
        reward = await getPopulatedRewardById(args.rewardId.toLowerCase())
        if(!reward) throw new UserInputError('Esta recompensa no existe o ya fué reclamada.')
      } catch (error){
        throw new UserInputError('Esta recompensa no existe o ya fué reclamada.')
      }
      
      let gainedCards = await claimReward(user, reward.lootBag)
      reward.delete()
      return gainedCards;
    },
  },
};
