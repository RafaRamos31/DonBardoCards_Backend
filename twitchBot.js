import tmi from 'tmi.js';
var client 
/**
 * Inicializate the twitch bot, with the environment provided credentials 
 */
export function startTwitchBot(){
  client = new tmi.Client({
    identity: {
      username: process.env.TWITCHBOT_USERNAME,
      password: process.env.TWITCHBOT_OAUTH
    },
    channels: [ process.env.TWITCHBOT_CHANNEL ]
  });
  
  client.connect();
}

/**
 * Make the Twitch Bot to write a message on the Twitch chat
 * @param  {String} message the message to send
 */
export function sendTwitchMessage(message){
  client.say(process.env.TWITCHBOT_CHANNEL, `${message}`);
}

