const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const formidable = require("formidable");
const channelID = process.env.CHANNEL_ID;
const token = process.env.TOKEN;

function serializeMessage(message) {
  return {
      channelId: message.channelId,
      guildId: message.guildId,
      id: message.id,
      createdTimestamp: message.createdTimestamp,
      type: message.type,
      system: message.system,
      content: message.content,
      author: {
          id: message.author.id,
          bot: message.author.bot,
          system: message.author.system,
          flags: message.author.flags.bitfield,
          username: message.author.username,
          discriminator: message.author.discriminator,
          avatar: message.author.avatar,
          banner: message.author.banner,
          accentColor: message.author.accentColor
      },
      pinned: message.pinned,
      tts: message.tts,
      nonce: message.nonce,
      embeds: message.embeds.map(embed => embed.toJSON()),
      components: message.components.map(component => component.toJSON()),
      attachments: Array.from(message.attachments.values()).map(attachment => ({
          id: attachment.id,
          url: attachment.url,
          name: attachment.name,
          size: attachment.size,
          height: attachment.height,
          width: attachment.width,
          contentType: attachment.contentType
      }))
  };
}

module.exports = async (req, res) => {
  if (req.method === "POST") {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {

      if (err) {
        console.error("Error parsing the form:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log("Received files:", files);

      const fileData = files.fileToUpload[0];

      if (!fileData) res.status(400).send("No file uploaded");
      const attachment = new AttachmentBuilder(fileData.filepath, {
        name: fileData.originalFilename,
      });

      // Initialize Discord client and send the file
      const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
      });

      client.once("ready", async () => {
        try {
          const channel = await client.channels.fetch(channelID);
          const sentMessage = await channel.send({ content: 'Here is the uploaded file:', files: [attachment] });

          const fetchedMessage = await channel.messages.fetch(sentMessage.id);

          const serializedMessage = serializeMessage(fetchedMessage);

          client.destroy();
          res.status(200).json({ messageInfo: serializedMessage });
        } catch (error) {
          console.error("Bot error:", error);
          client.destroy();
          res.status(500).send("An error occurred with the bot");
        }
      });

      client.login(token);
    });
  } else {
    res.status(405).send("Method Not Allowed");
  }
};
