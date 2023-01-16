import StreamStatus from "../models/streamStatus.js"
import Game from "../models/game.js"
import { gql, UserInputError } from "apollo-server";
import { currentStatus } from "../../controllers/statusController.js";
import LootBag from "../models/lootBag.js";


export const streamTypes = gql`
  type RarityWeight {
    cardType: Rarity!
    weight: Int!
  }

  input RarityWeightInput {
    cardType: Rarity!
    weight: Int!
  }
  
  type StreamStatus {
    ref: Int!
    isActive: Boolean!
    currentGame: Game
    appUsername: String!
    giftLootbag: LootBag
    rarityWeights: [RarityWeight]!
  }

  extend type Query {
    getStatus: StreamStatus!
  }

  extend type Mutation {
    toggleStatus: StreamStatus!
    changeGame(gameId: String, noGame: Boolean): StreamStatus!
    changeDefaultLootbag(lootBagId: String): StreamStatus!
  }
`;

export const streamResolvers = {
  Query: {
    getStatus: currentStatus,
  },
  Mutation: {
    toggleStatus: async (root, args) => {
      let status = await currentStatus()
      status.isActive = !status.isActive
      return status.save();
    },
    changeGame: async (root, args) => {
      let status = await currentStatus()

      if(args.noGame == true){
        status.currentGame = null
        return status.save()
      }
      
      let game
      try{
        game = await Game.findById(args.gameId)
        if(!game) return UserInputError('Juego no encontrado')

        status.currentGame = game
        return status.save()

      } catch (error){
        return new UserInputError('El identificador del juego no cumple el formato utilizado')
      }
    },
    changeDefaultLootbag: async (root, args) => {
      let status = await currentStatus()

      let lootbag
      try{
        lootbag = await LootBag.findById(args.lootBagId)
        if(!lootbag) return UserInputError('Lootbag no encontrada')

        status.giftLootbag = lootbag
        return status.save()

      } catch (error){
        return new UserInputError('El identificador de la lootbag no cumple el formato utilizado')
      }
    }
  },
};
