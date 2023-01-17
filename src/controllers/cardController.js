import Card from "../schema/models/card.js";
import Game from "../schema/models/game.js";
import { UserInputError } from "apollo-server";
import { getDateString } from "../utilities/timeUtilities.js";

export async function findCards(gameId = null, rarity = null, query = null) {
  let queryParams = {};

  if (gameId != null) {
    try {
      const game = await Game.findById(gameId);
      queryParams = { game };
    } catch (error) {
      return new UserInputError(
        "El identificador del juego no cumple el formato utilizado"
      );
    }
  }

  if (rarity != null) {
    queryParams = { ...queryParams, rarity };
  }

  if (query != null) {
    queryParams = {
      ...queryParams,
      name: new RegExp(".*" + query + ".*", "g"),
    };
  }

  return Card.find(queryParams).populate("game");
}

export async function updateLimitedCard(cardId, quantity) {
  let card;
  try {
    card = await Card.findById(cardId).populate("game");
    if (!card) return UserInputError("Carta no encontrada");
  } catch (error) {
    return new UserInputError(
      "El identificador de la carta no cumple el formato utilizado"
    );
  }
  card.limited.existences = card.limited.existences - quantity

  return card.save();
}

export function updateCooldownCard(card, quantity){
  let seconds = card.cooldown.secondsCooldown * quantity
  if(card.cooldown.addStackCooldown === true){
    seconds += card.cooldown.stackSecondsApport
  }
  
  let nextUse = Date.now() + (seconds*1000)
  card.cooldown.cooldownFinishAt = getDateString(nextUse)
  card.save()
}