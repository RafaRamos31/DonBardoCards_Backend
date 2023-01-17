import { encrypt } from "./src/utilities/decoder.js";
import { createChatReward, createReward } from "./src/controllers/rewardController.js";
import { sendTwitchMessage } from "./twitchBot.js";

export function addRestDirections(app) {
  app.get("/registerURL/:username", (request, response) => {
    const username = request.params.username;
    response.status(200).send(`donbardoapi.com/register/${encrypt(username)}`);
  });

  app.get("/freeLoot", async (request, response) => {
    let message = await createChatReward();
    response.status(200).send(message);
  });

  app.get("/buyLootBag/:username/:lootBagId", async (request, response) => {
    const username = request.params.username;
    const lootBagId = request.params.lootBagId;
    response.set('Content-Type', 'text/plain')
    try{
      let reward = await createReward(username, lootBagId);
      response.status(200).send();
    }catch(error){
      response.status(400).send(error.message)
    }
  });

  app.get("/useCards/:commandId", (request, response) => {
    const commandId = request.params.commandId;
    sendTwitchMessage(commandId)
    response.status(200).send(`Comando ejecutado en Twitch`);
  });

  return app;
}
