import Reward from "../schema/models/reward.js";
import { drawCards } from "../utilities/cardSelector.js";
import { findCards, updateLimitedCard } from "./cardsController.js";
import { currentStatus } from "./statusController.js";
import { getDefaultUser, mergeNewCards } from "./userController.js";
import { getDateString } from "../utilities/registerUtilities.js";

export async function getPopulatedRewards(userId = null) {
  let queryParams = {};
  if (userId != null) {
    queryParams = { purchaserID: userId };
  }
  return await Reward.find(queryParams).populate({
    path: "lootBag",
    model: "LootBag",
    populate: [
      {
        path: "fixedGame",
        model: "Game",
      },
    ],
  });
}

export async function getPopulatedRewardById(rewardId) {
  return Reward.findById(rewardId).populate({
    path: "lootBag",
    model: "LootBag",
    populate: [{ path: "fixedGame", model: "Game" }],
  });
}

export async function claimReward(user, lootbag) {
  let allCards;
  if (lootbag.fixedGame != null) {
    allCards = await findCards(lootbag.fixedGame.id);
  } else {
    allCards = await findCards();
  }

  let { rarityWeights } = await currentStatus();
  const rewardCards = drawCards(
    allCards,
    lootbag.totalCards,
    lootbag.fixedCards,
    rarityWeights
  );

  rewardCards.forEach((rewardCard) => {
    if (rewardCard.card.limited != null) {
      updateLimitedCard(rewardCard.card.id, rewardCard.quantity);
    }
  });

  user = mergeNewCards(user, rewardCards);
  user.stats.totalOpenings = user.stats.totalOpenings + 1;
  user.save();

  return rewardCards;
}

export async function createChatReward() {
  let status = await currentStatus();

  if(status.giftLootbag == null){
    return null
  }

  let user = await getDefaultUser()
  const reward = new Reward({
    purchaserID: user.id,
    purchaserName: user.username,
    obtainDate: getDateString(),
    lootBag: status.giftLootbag
  });
  reward.save()
  return `Regalo para el Chat! Canjea este codigo para conseguir un sobre gratis: ${reward.id.toUpperCase()}`; 
}
