const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const formidable = require("formidable");
const channelID = process.env.CHANNEL_ID;
const token = process.env.TOKEN;

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
          const sentMessage = await channel.send({
            content: "Here is the uploaded file:",
            files: [attachment],
          });

          const attachmentData = sentMessage.attachments.first();
          if (attachmentData) {
            const responseData = {
              url: attachmentData.url,
              name: attachmentData.name,
            };
            res.status(200).json(responseData);
          } else {
            res.status(500).send("Failed to send the file");
          }
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
