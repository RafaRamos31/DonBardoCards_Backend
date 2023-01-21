import Game from "../schema/models/game.js";
import { throwInvalidArgsError, throwInvalidIDError, throwNotFoundError } from "../utilities/errorHandler.js";
import { getCurrentStatus } from "./statusController.js";

// CRUD METHODS

/**
 * Creates a new Game and add it to the Database
 * @param {String} name the name from the game
 * @param {String} iconURL  an URL direction to the icon of the game
 * @return {Game}      the generated game Object
 */
export async function createNewGame(name, iconURL = null) {
  const game = new Game({
    name,
    iconURL,
  });
  return game.save().catch((error) => { throwInvalidArgsError(error.message, {name, iconURL})});
}

/**
 * Return a specific set of Games from the database
 * @return {Game[]}      the selected list of Game objects
 */
export async function getAllGames() {
  return await Game.find({})
}

/**
 * Return a specific game from the database using the gameId
 * @param {String} gameId the id of the game to find
 * @return {Game | null}      the founded Game object
 */
export async function findGameById(gameId) {
  return await Game.findById(gameId).catch(() => { throwInvalidIDError('Game') });
}

/**
 * Return a specific game from the database using the name
 * @param {String} gameName the name of the game to find
 * @return {Game | null}      the founded Game object
 */
export async function findGameByName(gameName) {
  return await Game.findOne({name: gameName})
}

/**
 * Changes the parameters of an existing game
 * @param {String} gameId the id of the game to modify
 * @param {String} name the name to assign to the game
 * @param {String} iconURL  the iconURL to assign to the game
 * @return {Game}      the updated game Object
 */
export async function updateGame(gameId, name, iconURL = null) {
  let game = await findGameById(gameId)
  if(!game) throwNotFoundError('Game')

  game.name = name
  game.iconURL = iconURL

  return game.save().catch((error) => { throwInvalidArgsError(error.message, {gameId, name, iconURL})});
}

/**
 * Deletes a selected game by its Id
 * @param {String} gameId the id of the game to delete
 * @return {Game}      the deleted game Object
 */
export async function deleteGame(gameId) {
  const game = await findGameById(gameId)
  if(!game) throwNotFoundError('Game')
  return game.delete()
}


// ADDITIONAL METHODS

/**
 * Returns the default game from the application, if it doesn't exist, creates it
 * @return {Game}      the default game Object
 */
export async function getDefaultGame() {
  const { appDefaultGameName } = await getCurrentStatus()
  let defaultGame = await Game.findOne({ name: appDefaultGameName });
  defaultGame = defaultGame ? defaultGame : createNewGame(appDefaultGameName) 
  return defaultGame;
}

/**
 * Edits the name of the default game from the app
 * @param {String} gameName the new name for the game
 */
export async function editDefaultGame(gameName) {
  const { appDefaultGameName } = await getCurrentStatus()
  let defaultGame = await findGameByName(appDefaultGameName)
  if(defaultGame){
    defaultGame.name = gameName
    defaultGame.save()
  }
  else{
    createNewGame(gameName)
  }
}
