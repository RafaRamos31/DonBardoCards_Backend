import Game from "../schema/models/game.js";
import { UserInputError } from "apollo-server";

export async function getDefaultGame() {
  let defaultGame = await Game.findOne({ name: 'Channel' });
  if (defaultGame == null) {
    defaultGame = createNewGame('Channel');
  }
  return defaultGame;
}

export async function createNewGame(name, iconURL) {
  const game = new Game({
    name,
    iconURL
  });
  return game.save().catch((error) => {
    throw new UserInputError(error.message, {
      invalidArgs: args,
    });
  });
}
