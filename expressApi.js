import { decrypt, encrypt } from "./src/utilities/decoder.js";
import { createChatReward, createNewReward } from "./src/controllers/rewardController.js";
import { startStream } from "./src/controllers/statusController.js";

/**
 * Add the routes and resolution from REST petitions to the Express Server
 * @param  {Express} app the inicializated Server
 * @return {Express}      the Server plus the REST petitions resolvers
 */
export function addRestDirections(app) {
  //GET petition, that generates an register URL from the Web Page
  app.get("/registerURL/:username", (request, response) => {
    response.set('Content-Type', 'text/plain')
    const username = request.params.username;
    response.status(200).send(`${process.env.FRONTEND_URL}/register/${encrypt(username)}`);
  });

  //GET petition, that transform the register code into the actual Username
  app.get("/getUsername/:userCode", (request, response) => {
    response.set('Content-Type', 'text/plain')
    const userCode = request.params.userCode;
    response.status(200).send(`${decrypt(userCode)}`);
  });


  //GET petition, that generates a new Basic lootbag and returns its Claim Code
  app.get("/freeLoot", async (request, response) => {
    let message = await createChatReward();
    response.status(200).send(message);
  });

  //GET petition, used by the Channel Points or bits rewards from Twitch
  app.get("/buyLootBag/:username/:lootBagId", async (request, response) => {
    const username = request.params.username;
    const lootBagId = request.params.lootBagId;
    response.set('Content-Type', 'text/plain')
    try{
      await createNewReward(username, lootBagId);
      response.status(200).send();
    }catch(error){
      response.status(400).send(error.message)
    }
  });

   //GET petition, initializate the Stream and set the current game, extracted from Twitch variables
  app.get("/start/:game", async (request, response) => {
    const game = request.params.game;
    response.set('Content-Type', 'text/plain')
    try{
      await startStream(game);
      response.status(200).send();
    }catch(error){
      response.status(400).send(error.message)
    }
  });

  return app;
}
