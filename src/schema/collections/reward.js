import Reward from "../models/reward.js"
import User from "../models/user.js"
import LootBag from "../models/lootBag.js"
import { getDateString } from "../../utilities/registerUtilities.js"
import { gql, UserInputError } from "apollo-server";
import { claimReward, getPopulatedRewardById, getPopulatedRewards } from "../../controllers/rewardController.js";
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
    createReward(userId: String!, lootBagId: String!): Reward
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
      let user
      try{
        user = await getPopulatedUser(args.userId)
        if(!user) return UserInputError('Usuario no encontrado')
      } catch (error){
        return new UserInputError('El identificador del usuario no cumple el formato utilizado')
      }

      let lootBag
      try{
        lootBag = await LootBag.findById(args.lootBagId).populate('fixedGame')
        if(!lootBag) return UserInputError('Lootbag no encontrada')
      } catch (error){
        return new UserInputError('El identificador de la Lootbag no cumple el formato utilizado')
      }

      const reward = new Reward({ 
        purchaserID: user.id,
        purchaserName: user.username,
        obtainDate: getDateString(),
        lootBag: lootBag
      });
      
      return reward.save();
    },
    claimReward: async (root, args) => {
      let user
      try{
        user = await getPopulatedUser(args.userId)
        if(!user) return UserInputError('Usuario no encontrado')
      } catch (error){
        return new UserInputError('El identificador del usuario no cumple el formato utilizado')
      }

      let reward
      try{
        reward = await getPopulatedRewardById(args.rewardId)
        if(!reward) throw new UserInputError('Esta recompensa no existe o ya fué reclamada.')
      } catch (error){
        return new UserInputError('Esta recompensa no existe o ya fué reclamada.')
      }
      
      let gainedCards = await claimReward(user, reward.lootBag)
      reward.delete()
      return gainedCards;
    },
  },
};
