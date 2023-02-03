import Card from "../schema/models/card.js";
import Game from "../schema/models/game.js";
import { throwInvalidArgsError, throwInvalidIDError, throwNotFoundError, throwUserInputError } from "../utilities/errorHandler.js";
import { getDateString, parseDateString, remainingTimeString } from "../utilities/timeUtilities.js";
import { getCurrentStatus } from "./statusController.js";
import { findGameById, getDefaultGame } from "./gameController.js";
import { discountUserCards, findUserById } from "./userController.js";
import { sendTwitchMessage } from "../../twitchBot.js"

// CRUD METHODS

/**
 * Return all the Card Objects from the database
 * @return {Card[]}      the list of Card objects
 */
export async function getAllCards() {
  return await Card.find({}).populate("game");
}

/**
 * Returns a Card Array depending of three search filters
 * @param  {String} gameId the game related to certain card
 * @param  {String} rarity the rarity from a selected card group
 * @param  {String} query a part of the card name
 * @return {Card[]}      the array with the cards that matches the search
 */
export async function findCards(gameId = null, rarity = null, query = null) {
  let queryParams = {};

  queryParams = gameId ? { game: await findGameById(gameId) } : queryParams;
  queryParams = rarity ? { ...queryParams, rarity } : queryParams;
  queryParams = query
    ? { ...queryParams, name: new RegExp(".*" + query + ".*", "gi") }
    : queryParams;

  //It's possible to combine multiple search filters at the same time
  return Card.find(queryParams).populate("game");
}

/**
 * Return a specific Card from the database using the cardId
 * @param {String} cardId the id of the Card to find
 * @return {Card | null}      the founded Card object
 */
export async function findCardById(cardId) {
  return await Card.findById(cardId).populate("game").catch(() => { throwInvalidIDError('Card') });
}

/**
 * Creates a new Card and add it to the Database
 * @param {Object} args the paramethers for the Card creation
 * @param {String} args.name the name for the Card
 * @param {String} args.imageURL an URL direction to a web image for the card
 * @param {String} args.description a detailed description of the effects of the card
 * @param {String} args.gameId the Id from the game related to the card, if empty a default game is assigned
 * @param {String} args.rarity the rarity type of the card, can be 'COMMON', 'RARE', 'EPIC', 'LEGENDADY' or 'UNIQUE'
 * @param {Number} args.fragments the amount of necesary fragments to make a whole usable card
 * @param {String} args.command a command displayed in Twitch chat when the card is used
 * @param {Boolean} args.stackable to indicate that multiple copies of a card can be used a the same time
 * @param {Number} args.secondsEffect the seconds that the effect of the card lasts when used
 * @param {Number} args.existences the number of remaining copies from a limited card
 * @param {Number} args.secondsCooldown the cooldown after using the card
 * @param {Number} args.secondsAfterStack an additional cooldown after using a stackable card
 * @return {Card}      the created Card object
 */
export async function createNewCard(args) {
  /** @type {Game} */
  let game;
  if (args.gameId != null) {
    game = await findGameById(args.gameId);
    if(!game) throwNotFoundError('Game')
  } 
  else{
    game = await getDefaultGame();
  }

  const card = new Card({
    name: args.name,
    imageURL: args.imageURL > 0 ? args.imageURL : null,
    description: args.description > 0 ? args.description : null,
    game: game,
    rarity: args.rarity,
    fragments: args.fragments,
    command: args.command,
    stackable: args.stackable,
    ...handleOptionalParams(
      args.secondsEffect,
      args.existences,
      args.secondsCooldown,
      args.secondsAfterStack
    ),
  });

  return card.save().catch((error) => { throwInvalidArgsError(error.message, args)});
}

/**
 * Updates a existing Card object and save it in the Database
 * @param {Object} args the paramethers for the Card Update
 * @param {String} args.cardId the ID from the card to update
 * @param {String} args.name the name for the Card
 * @param {String} args.imageURL an URL direction to a web image for the card
 * @param {String} args.description a detailed description of the effects of the card
 * @param {String} args.gameId the Id from the game related to the card, if empty a default game is assigned
 * @param {String} args.rarity the rarity type of the card, can be 'COMMON', 'RARE', 'EPIC', 'LEGENDADY' or 'UNIQUE'
 * @param {Number} args.fragments the amount of necesary fragments to make a whole usable card
 * @param {String} args.command a command displayed in Twitch chat when the card is used
 * @param {Boolean} args.stackable to indicate that multiple copies of a card can be used a the same time
 * @param {Number} args.secondsEffect the seconds that the effect of the card lasts when used
 * @param {Number} args.existences the number of remaining copies from a limited card
 * @param {Number} args.secondsCooldown the cooldown after using the card
 * @param {Number} args.secondsAfterStack an additional cooldown after using a stackable card
 * @return {Card}      the updated Card object
 */
export async function updateCard(args) {
  let card = await findCardById(args.cardId)
  if(!card) throwNotFoundError('Card')

  card.name = args.name
  card.imageURL = args.imageURL > 0 ? args.imageURL : null
  card.description = args.description > 0 ? args.description : null
  card.rarity = args.rarity
  card.fragments = args.fragments
  card.command = args.command
  card.stackable = args.stackable
  
  if (args.gameId != null) {
    const game = await findGameById(args.gameId);
    if(!game) throwNotFoundError('Game')
    card.game = game
  } 
  else {
    card.game = await getDefaultGame();
  }

  const { secondsEffect, limited, cooldown } = handleOptionalParams(
    args.secondsEffect,
    args.existences,
    args.secondsCooldown,
    args.secondsAfterStack
  )

  card.secondsEffect = secondsEffect
  card.limited = limited
  card.cooldown = cooldown
  
  return card.save().catch((error) => { throwInvalidArgsError(error.message, args)});
}

/**
 * Deletes a specific Card from the database using the cardId
 * @param {String} cardId the id of the Card to delete
 * @return {Card}      the deleted Card object
 */
export async function deleteCard(cardId) {
  const card = await findCardById(cardId)
  if(!card) throwNotFoundError('Card')
  return card.delete()
}

// ADDITIONAL METHODS

/**
 * Complete the optional parameters of a new or updated card
 * @param {Number} secondsEffect the seconds that the effect of the card lasts when used
 * @param {Number} existences the number of remaining copies from a limited card
 * @param {Number} secondsCooldown the cooldown after using the card
 * @param {Number} secondsAfterStack an additional cooldown after using a stackable card
 * @return {Object}      the remaining optional parameters to create or update the card
 */
function handleOptionalParams(
  secondsEffect,
  existences,
  secondsCooldown,
  secondsAfterStack
) {
  if (secondsEffect > secondsCooldown) throwUserInputError("Cooldown time needs to be higher than effect time")

  secondsEffect = secondsEffect > 0 ? secondsEffect : null;
  secondsAfterStack = secondsAfterStack > 0 ? secondsAfterStack : null;

  let limited = existences ? { existences } : null;

  let cooldown = secondsCooldown
    ? {
        cooldownFinishAt: getDateString(),
        secondsCooldown,
        secondsAfterStack,
      }
    : null;

  return { secondsEffect, limited, cooldown };
}

/**
 * Update the existences of certain card in the DB when drawed at rewards
 * @param  {String} cardId the ID from the Database card
 * @param  {Number} quantity the amount of card fragments to remove from the Database existences
 * @return {Card}      an updated copy of the card
 */
export async function updateLimitedCard(cardId, quantity) {
  const card = await findCardById(cardId);
  if(!card) throwNotFoundError('Card')

  card.limited.existences = card.limited.existences - quantity;
  return card.save();
}

/**
 * Update the next time to use a Cooldown card used by a User
 * @param  {Card} card the used Card object
 * @param  {Number} quantity the amount of cards used at the same time
 */
export function updateCooldownCard(card, quantity) {
  let seconds = card.cooldown.secondsCooldown * quantity;
  seconds = card.stackable ? seconds + card.cooldown.secondsAfterStack : seconds

  let nextUse = Date.now() + seconds * 1000;
  card.cooldown.cooldownFinishAt = getDateString(nextUse);
  card.save();
}

/**
 * Select a card from the user inventory to use it in the Twitch chat
 * @param {String} userId the ID of the redeemer user
 * @param {String} cardId the ID of the card to use for the command
 * @param {Number} fragments the amount of fragments used
 * @return {String}      the command displayed in the Twitch chat
 */
export async function useCards(userId, cardId, fragments){
  let { currentGame, isActive } = await getCurrentStatus();
  //The streamer needs to be online to use cards
  if(!isActive) throwUserInputError("You can't use cards when the stream is off")

  //Validating the requested objects
  let user = await findUserById(userId)
  if(!user) throwNotFoundError('User')

  let card = await findCardById(cardId)
  if(!card) throwNotFoundError('Card')

  //The card needs to be an any moment use card, or a current game card
  let defaultGame = getDefaultGame()
  const currentName = currentGame ? currentGame.name : null;
  
  if(!(card.game.name == currentName || card.game.name == defaultGame.name)){
    throwUserInputError(`You can't use ${card.game.name} cards in this moment.`)
  }

  //The card needs to not be in cooldown
  if(card.cooldown != null){
    let nextUse = parseDateString(card.cooldown.cooldownFinishAt)
    if(nextUse > new Date()){
      throwUserInputError(`${remainingTimeString(nextUse)} until next usage of this card.`)
    }
  }

  //Validate the user has the requested amount of fragments in its inventory
  var valid = false
  if(user.cards.length > 0){
    user.cards.forEach(userCard => {
      if(userCard.card && userCard.card.id == card.id && userCard.quantity >= fragments){
        valid = true
      } 
    });
  }
  if(!valid) throwUserInputError(`Invalid amount of fragments.`)

  //Validate if there are enough fragments to create one card
  if(fragments < card.fragments) throwUserInputError(`More fragments needed to use this card.`)

  //Craft the max posible amount of cards (7 fragments sent => 3 fragments required => quantity=2)
  let quantity = Math.floor(fragments / card.fragments)

  //Only stackable cards can have quantities > 1
  if(!card.stackable){
    quantity = 1
  }

  //Modify the user cards
  discountUserCards(user, card, quantity)

  //Updating cooldown cards
  if(card.cooldown) updateCooldownCard(card, quantity)

  //Generating the command
  const result = `!${card.command} ${quantity}`

  //Sending the command to the Twitch chat
  sendTwitchMessage(result)
  
  return result
}