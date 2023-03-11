import LootBag from "../schema/models/lootBag.js";
import Game from "../schema/models/game.js";
import { throwCustomError, throwInvalidArgsError, throwInvalidIDError, throwNotFoundError } from "../utilities/errorHandler.js";
import { findGameById } from "./gameController.js";

/**
 * @typedef {Object} FixedCard
 * @property {String} cardType the rarity of the card
 * @property {Number} quantity the amount of cards to always draw from that rarity
*/

// CRUD METHODS

/**
 * Return a specific set of Lootbags from the database
 * @return {LootBag[]}      the selected list of Lootbag objects
 */
export async function getAllLootbags() {
  return await LootBag.find({}).populate("fixedGame");
}

/**
 * Return a specific lootbag from the database using the lootbagId
 * @param {String} lootbagId the id of the lootbag to find
 * @return {LootBag | null}      the founded Lootbag object
 */
export async function findLootbagById(lootbagId) {
  return await LootBag.findById(lootbagId).populate('fixedGame').catch(() => { throwInvalidIDError('Lootbag') });
}

/**
 * Creates a new Lootbag and add it to the Database
 * @param {Object} args the paramethers for the lootbag creation
 * @param {String} args.name the name for the lootbag
 * @param {String} args.description a descriptive text to explain the qualities of the lootbag
 * @param {String} args.color a hexadecimal code saved for decorative purposes of the lootbag
 * @param {Number} args.totalCards the total amount of cards that can be obtained from the lootbag
 * @param {String} args.fixedGameId makes the lootbag to give cards only from the selected game
 * @param {FixedCard[]} args.fixedCards a set of preferences to get specific cards from the lootbag
 * @param {String} args.channelPoints the Twitch Channel Points price from the lootbag
 * @param {String} args.bits the Twitch Bits price from the lootbag
 * @return {LootBag}      the created Lootbag object
 */
export async function createNewLootbag(args) {
  /** @type {Game | null} */
  let game = null
  if (args.fixedGameId){
    game = await findGameById(args.fixedGameId)
    if(!game) throwNotFoundError('Game')
  }
  
  const lootBag = new LootBag({
    name: args.name,
    description: args.description,
    color: args.color,
    totalCards: args.totalCards,
    channelPoints: args.channelPoints,
    bits: args.bits,
    fixedGame: game,
    fixedCards: validateFixedCards(args.fixedCards, args.totalCards),
  });
  lootBag.twitchCommand = `\${urlfetch ${process.env.TWITCH_BUY_URL}/buyLootBag/\${redeemer.name}/${lootBag.id}}`;
  return lootBag.save().catch((error) => { throwInvalidArgsError(error.message, args)});
}

/**
 * Updates the values of an existing Lootbag and save the changes in Database
 * @param {Object} args the paramethers for the lootbag modification
 * @param {String} args.id the id of the Lootbag object to modify
 * @param {String} args.name the name for the lootbag
 * @param {String} args.description a descriptive text to explain the qualities of the lootbag
 * @param {String} args.color a hexadecimal code saved for decorative purposes of the lootbag
 * @param {Number} args.totalCards the total amount of cards that can be obtained from the lootbag
 * @param {String} args.fixedGameId makes the lootbag to give cards only from the selected game
 * @param {FixedCard[]} args.fixedCards a set of preferences to get specific cards from the lootbag
 * @param {String} args.channelPoints the Twitch Channel Points price from the lootbag
 * @param {String} args.bits the Twitch Bits price from the lootbag
 * @return {LootBag}      the updated Lootbag object
 */
export async function updateLootbag(args) {

  let lootBag = await findLootbagById(args.id)
  if(!lootBag) throwNotFoundError('Lootbag')

  lootBag.name = args.name
  lootBag.description = args.description
  lootBag.color = args.color
  lootBag.totalCards = args.totalCards
  lootBag.channelPoints = args.channelPoints
  lootBag.bits = args.bits

  if(args.fixedGameId){
    const game = await findGameById(args.fixedGameId)
    if(!game) throwNotFoundError('Game')

    lootBag.fixedGame = game 
  }
  else{
    lootBag.fixedGame = null 
  }

  lootBag.fixedCards = validateFixedCards(args.fixedCards, args.totalCards)
  
  return lootBag.save().catch((error) => { throwInvalidArgsError(error.message, args)});
}

/**
 * Delete a specific lootbag from the database using the lootbagId
 * @param {String} lootbagId the id of the lootbag to delete
 * @return {LootBag}      the deleted Lootbag object
 */
export async function deleteLootBag(lootbagId) {
  const lootbag = await findLootbagById(lootbagId)
  if(!lootbag) throwNotFoundError('Lootbag')
  return lootbag.delete()
}

// ADDITIONAL METHODS

/**
 * Evaluates the content of the fixedCards param, to assign a value to the lootbag property
 * @param {FixedCard[]} fixedCards a set of preferences to get specific cards from the lootbag
 * @param {Number} totalCards the total amount of cards that can be obtained from the lootbag
 * @return {FixedCard[] | null}      the expected value for the fixedCards property
 */
function validateFixedCards(fixedCards, totalCards){
  if(fixedCards){
    /** @type {FixedCard[]} */
    let cards = [];
    let totalFixedCards = 0
    fixedCards.forEach((card) => {
      totalFixedCards += card.quantity
      cards = cards.concat({
        cardType: card.cardType,
        quantity: card.quantity,
      });
    });
    if(totalFixedCards <= totalCards) return cards

    throwCustomError(`It's not possible to add ${totalFixedCards} fixed cards to a ${totalCards} cards lootbag.`, 'NOT_ENOUGH_CARDS_ERROR')
  }
  return null
}