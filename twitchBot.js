import tmi from 'tmi.js';

var client 

export function startTwitchBot(){
  client = new tmi.Client({
    identity: {
      username: process.env.TWITCHBOT_USERNAME,
      password: process.env.TWITCHBOT_OAUTH
    },
    channels: [ process.env.TWITCHBOT_CHANNEL ]
  });
  
  client.connect();
  /*client.on('message', (channel, tags, message, self) => {
    if(self || !message.startsWith('!')) return;
  
    const args = message.slice(1).split(' ');
    const command = args.shift().toLowerCase();
  
    if(command === 'echo') {
      client.say(channel, `@${tags.username}, you said: "${args.join(' ')}"`);
    }
  });*/
}

export function sendTwitchMessage(message){
  client.say(process.env.TWITCHBOT_CHANNEL, `${message}`);
}

