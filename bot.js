// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, ChannelType } = require("discord.js");
const { token, channelID } = require("../config.json");

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Required in v14 to access message content
  ],
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  // Example: Send a message to a channel by name
  const channelName = "images"; // Replace with your channel name
  const channel = client.channels.cache.find(
    (c) => c.name === channelName && c.type === ChannelType.GuildText
  );

  if (channel) {
    channel.send("Hello, this is a message from the bot!");
  } else {
    console.log("Channel not found");
  }
});

client.on("messageCreate", (message) => {
  if (message.content === "ping") {
    message.reply("pong");
  }
  if (message.attachments.size > 0) {
    message.attachments.forEach(attachment => {
        console.log('Attachment URL:', attachment.url);
        console.log('Attachment Name:', attachment.name);
        console.log('Attachment Size:', attachment.size);
        // You can add more properties to log as needed
    });
}
});

// Log in to Discord with your client's token
client.login(token);
