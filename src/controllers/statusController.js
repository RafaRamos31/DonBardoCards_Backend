import StreamStatus from "../schema/models/streamStatus.js";
import { throwInvalidArgsError } from "../utilities/errorHandler.js";
import { createNewGame, editDefaultGame, findGameById, findGameByName } from "./gameController.js";
import { findLootbagById } from "./lootbagController.js";
import { editDefaultUser } from "./userController.js";

/**
 * Get the current status and configurations from the app, if doesn't exists, creates it
 * @return {StreamStatus}      the stored configurations from the app
 */
export async function getCurrentStatus(){
  let status = await StreamStatus.findOne({ ref: 1 }).populate([{path: 'currentGame', model: 'Game'}, 
    {path: 'giftLootbag', model: 'LootBag', populate:[{path: 'fixedGame', model: 'Game'}]}]);
  if (status == null) {
    status = initializate();
  }
  return status;
};

/**
 * Set the default configurations for the application
 * @return {StreamStatus}      the stored configurations from the app
 */
function initializate(){
  const defaultStatus = new StreamStatus({
    //An easy way to identify the object in the database
    ref: 1,
    //The streamer is live or don't
    isActive: false,
    //Current playing game (affects if a card can be used or not)
    currentGame: null,
    //The default lootbag for the rewards created by the default user
    defaultLootbag: null,
    //The name of the automatic reward user creator
    appUsername: 'Anonymous Gifter',
    //The name of the automatic reward user creator
    appUserPassword: 'password',
    //The name of the default game to make cards
    appDefaultGameName: 'Default Game',
    //The number of copies of every card for the random picking process
    rarityWeights: [
      {
        cardType: 'COMMON',
        weight: 10
      },
      {
        cardType: 'RARE',
        weight: 7
      },
      {
        cardType: 'EPIC',
        weight: 4
      },
      {
        cardType: 'LEGENDARY',
        weight: 2
      },
      {
        cardType: 'UNIQUE',
        weight: 1
      },
    ]
  })
  return defaultStatus.save()
}

/**
 * Edit the configurations of the stream
 * @param {Object} args the list of configurations from the app
 * @param {Boolean} args.isActive the current state of online streaming from the Streamer
 * @param {String} args.currentGameId the ID of the current playing game
 * @param {String} args.giftLootbagId the ID of the current lootbag available for gifts
 * @param {String} args.appUsername the name of the app gifter user
 * @param {String} args.appUserPassword the password of the app gifter user
 * @param {String} args.appDefaultGameName the name for the default game for cards
 * @param {Array} args.rarityWeights the list with the number of copies to generate when draw cards by rarity
 * @return {StreamStatus} the modified status
 */
export async function editStatus(args){
  let status = await getCurrentStatus()
  
  status.isActive = args.isActive
  status.rarityWeights = args.rarityWeights

  if(!status.currentGame || status.currentGame.id != args.currentGameId){
    status.currentGame = await findGameById(args.currentGameId)
  }

  if(!status.giftLootbag || status.giftLootbag.id != args.giftLootbagId){
    status.giftLootbag = await findLootbagById(args.giftLootbagId)
  }

  if(args.appUsername != status.appUsername || args.appUserPassword != status.appUserPassword){
    await editDefaultUser(args.appUsername, args.appUserPassword)
    status.appUsername = args.appUsername
    status.appUserPassword = args.appUserPassword
  }

  if(args.appDefaultGameName != status.appDefaultGameName){
    await editDefaultGame(args.appDefaultGameName)
    status.appDefaultGameName = args.appDefaultGameName
  }

  return status.save().catch((error) => throwInvalidArgsError(error.message, args))
}

/**
 * Change to Active state and set the current game of the stream
 * @param {String} gameName the name from the game to play
 */
export async function startStream(gameName){
  let game = await findGameByName(gameName)
  game = game ? game : await createNewGame(gameName)

  let status = await getCurrentStatus()
  status.isActive = true
  status.currentGame = game
  status.save()
}

/**
 * Toggle the current isActive status of the stream
 * @return {StreamStatus} the changed status
 */
export async function toggleStatus(){
  let status = await getCurrentStatus()
  status.isActive = !status.isActive
  return status.save();
}
