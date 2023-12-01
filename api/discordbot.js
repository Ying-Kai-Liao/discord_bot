const { Client, GatewayIntentBits } = require('discord.js');
const channelID = process.env.CHANNEL_ID
const token = process.env.TOKEN

module.exports = async (req, res) => {
  if (req.method === 'POST') { // Change to 'GET' if you prefer
      const client = new Client({
          intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
      });

      client.once('ready', async () => {
          try {
              // Example: Send a message to a specific channel
              const channel = await client.channels.fetch(channelID);
              await channel.send('Hello from the bot!');
              client.destroy();
              res.status(200).send('Message sent successfully');
          } catch (error) {
              client.destroy();
              res.status(500).send('An error occurred');
          }
      });

      client.login(token);
  } else {
      res.status(405).send('Method Not Allowed');
  }
};