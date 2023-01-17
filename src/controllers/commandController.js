import Command from "../schema/models/command.js";
import { currentStatus } from "./statusController.js";
import { getDefaultGame } from "./gameController.js";
import { UserInputError } from "apollo-server-express";
import { parseDateString, remainingTimeString } from "../utilities/timeUtilities.js";
import { discountUserCards } from "./userController.js";
import { updateCooldownCard } from "./cardController.js";

export async function getPopulatedCommand(userId) {
  let queryParams = {};

  if (userId != null) {
    queryParams = { userId };
  }

  return await Command.find(queryParams).populate([
    {
      path: "card",
      model: "Card",
      populate: [
        {
          path: "game",
          model: "Game",
        },
      ],
    }
  ]);
}

export async function useCards(user, card, fragments){
  let { currentGame } = await currentStatus();
  let defaultGame = await getDefaultGame()
  const currentName = currentGame ? currentGame.name : null;
  
  if(!(card.game.name == currentName || card.game.name == defaultGame.name)){
    throw new UserInputError(`No puedes gastar cartas de ${card.game.name} en este momento.`)
  }

  if(card.cooldown != null){
    let nextUse = parseDateString(card.cooldown.cooldownFinishAt)
    if(nextUse > new Date()){
      throw new UserInputError(`Falta ${remainingTimeString(nextUse)} para poder usar de nuevo esta carta.`)
    }
  }

  var valid = false
  if(user.cards.length > 0){
    user.cards.forEach(userCard => {
      if(userCard.card.id == card.id && userCard.quantity >= fragments){
        valid = true
      } 
    });
  }

  if(!valid){
    throw new UserInputError(`Cantidad de fragmentos utilizados no valida.`)
  }

  if(fragments < card.fragments){
    throw new UserInputError(`Necesitas mas fragmentos para utilizar esta carta.`)
  }

  let quantity = Math.floor(fragments / card.fragments)

  if(!card.stackable){
    quantity = 1
  }

  discountUserCards(user, card, quantity)
  if(card.cooldown) updateCooldownCard(card, quantity)

  const result = `!${card.command} ${quantity}`
  return {quantity, result}
}
