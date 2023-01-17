import { UserInputError } from "apollo-server";
import Reward from "../schema/models/reward.js";
import LootBag from "../schema/models/lootBag.js"
import { drawCards } from "../utilities/cardSelector.js";
import { findCards, updateLimitedCard } from "./cardController.js";
import { currentStatus } from "./statusController.js";
import { createNewUser, getDefaultUser, mergeNewCards } from "./userController.js";
import { getPopulatedUser } from "./userController.js";
import { getDateString } from "../utilities/timeUtilities.js";

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

export async function createReward(username, lootBagId) {
  let user;
  try {
    user = await getPopulatedUser(null, username);
    if (!user){
      user = await createNewUser(username)
    } 
  } catch (error) {
    throw new UserInputError(
      "El identificador del usuario no cumple el formato utilizado"
    );
  }

  let lootBag;
  try {
    lootBag = await LootBag.findById(lootBagId).populate("fixedGame");
    if (!lootBag) throw new UserInputError("Lootbag no encontrada");
  } catch (error) {
    throw new UserInputError(
      "El identificador de la Lootbag no cumple el formato utilizado"
    );
  }

  const reward = new Reward({
    purchaserID: user.id,
    purchaserName: user.username,
    obtainDate: getDateString(),
    lootBag: lootBag,
  });

  return reward.save()
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
  return reward.id.toUpperCase();
}
