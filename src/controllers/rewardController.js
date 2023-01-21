import Reward from "../schema/models/reward.js";
import { drawCards } from "../utilities/cardSelector.js";
import { getDateString } from "../utilities/timeUtilities.js";
import { throwCustomError, throwInvalidArgsError, throwInvalidIDError, throwNotFoundError } from "../utilities/errorHandler.js";
import { getCurrentStatus } from "./statusController.js";
import { findCards, updateLimitedCard } from "./cardController.js";
import { createNewUser, findUserById, findUserByName, getDefaultUser, mergeNewCards } from "./userController.js";
import { findLootbagById } from "./lootbagController.js";

// CRUD METHODS

/**
 * Return all the Reward Objects from the database
 * @return {Reward[]}      the list of Reward objects
 */
export async function getAllRewards() {
  return await Reward.find({}).populate({
    path: "lootBag",
    model: "LootBag",
    populate: [{ path: "fixedGame", model: "Game" }],
  });
}

/**
 * Returns a list with the user rewards
 * @param {String} userId the user whose rewards want to see
 * @return {Reward[]}      an array with the corresponding Reward objects
 */
export async function getUserRewards(userId) {
  return await Reward.find({ purchaserID: userId }).populate({
    path: "lootBag",
    model: "LootBag",
    populate: [{ path: "fixedGame", model: "Game" }],
  });
}

/**
 * Returns one Reward Object searched by its ID
 * @param {String} rewardId the ID from the reward
 * @return {Reward}      the selected Reward object
 */
export async function findRewardById(rewardId) {
  return Reward.findById(rewardId).populate({
    path: "lootBag",
    model: "LootBag",
    populate: [{ path: "fixedGame", model: "Game" }],
  }).catch(() => { throwInvalidIDError('Reward') });
}

/**
 * Creates a new reward object containing a existent lootbag and tagging the user that created it
 * @param {String} username the username from the redeemer
 * @param {String} lootBagId  the ID from the selected lootbag for the reward
 * @return {Reward}      the generated Reward object
 */
export async function createNewReward(username, lootBagId) {
  //Validates the existence of the user, if doesn't exist, creates it
  let user = await findUserByName(username)
  user = user ? user : await createNewUser(username)

  //Validates the existence of the lootbag
  let lootBag = await findLootbagById(lootBagId)
  if(!lootBag) throwNotFoundError('Lootbag')

  //If both are valid, creates a new reward
  const reward = new Reward({
    purchaserID: user.id,
    purchaserName: user.username,
    obtainDate: getDateString(),
    lootBag: lootBag,
  });

  return reward.save().catch((error) => { throwInvalidArgsError(error.message, {username, lootBagId})});
}

/**
 * Deletes a selected Reward by its Id
 * @param {String} rewardId the id of the reward to delete
 * @return {Reward}      the deleted reward Object
 */
export async function deleteReward(rewardId) {
  const reward = await findRewardById(rewardId)
  if(!reward) throwNotFoundError('Reward')
  return reward.delete()
}


// ADDITIONAL METHODS

/**
 * Redeem the content of a lootbag, and adds it to the user cards
 * @param {String} userId the Id of the redeemer user
 * @param {String} rewardId  the Id of the reward to claim
 * @return {Array}      an array with the obtained cards an its quantity
 */
export async function claimReward(userId, rewardId) {
  let user = await findUserById(userId)
  if(!user) throwNotFoundError('User')

  let reward = await findRewardById(rewardId)
  if(!reward) throwNotFoundError('Reward')
  let lootbag = reward.lootBag

  //Determines the cards pool: all the cards, or only certain game cards (fixedGame)
  let allCards = lootbag.fixedGame ? await findCards(lootbag.fixedGame.id) : await findCards()
  //if(allCards.length == 0) throwCustomError('Not enough existent cards', 'NOT_ENOUGH_CARDS_ERROR')

  //Gets the app stored weight of every rarity type, determines the % to draw certain rarity cards
  let { rarityWeights } = await getCurrentStatus();

  //Gets the reward cards
  let rewardCards = drawCards(
    allCards,
    lootbag.totalCards,
    lootbag.fixedCards,
    rarityWeights
  );

  //Checking for limited cards for update
  rewardCards.forEach((rewardCard) => {
    if (rewardCard.card.limited != null) {
      updateLimitedCard(rewardCard.card.id, rewardCard.quantity);
    }
  });

  //Adding the new cards to user collection
  [user , rewardCards] = mergeNewCards(user, rewardCards);

  //Updating lootbag opening counter from the user
  user.stats.totalOpenings = user.stats.totalOpenings + 1;

  //Saving all the changes
  user.save();

  //Deleting the claimed Reward
  reward.delete();

  return rewardCards;
}

/**
 * Creates a new reward by the default user and the default assigned lootbag
 * @return {Reward}      the generated Reward object
 */
export async function createChatReward() {
  let status = await getCurrentStatus();

  //Can't generate rewards if there is no lootbags, or a default lootbag assigned
  if (status.giftLootbag == null) {
    return null;
  }

  let user = await getDefaultUser();
  const reward = new Reward({
    purchaserID: user.id,
    purchaserName: user.username,
    obtainDate: getDateString(),
    lootBag: status.giftLootbag,
  });
  reward.save();
  
  //Uppercase code with alphanumeric values tends to look more attractive to the users
  return reward.id.toUpperCase();
}
