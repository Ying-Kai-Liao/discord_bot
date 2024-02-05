const { Client, GatewayIntentBits, AttachmentBuilder } = require("discord.js");
const formidable = require("formidable");
const channelID = process.env.CHANNEL_ID;
const token = process.env.TOKEN;

module.exports = async (req, res) => {
  // Set CORS headers for localhost:3000
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000", "https://chiangs-site.vercel.app/", "https://www.v-angel.com", "https://v-angel.com"); // Only allow requests from localhost:3000
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Handle OPTIONS request (CORS preflight)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method === "POST") {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("Error parsing the form:", err);
        res.status(500).send("Internal Server Error");
        return;
      }
      console.log("Received files:", files);

      const fileDataOne = files.fileToUpload[0];
      const fileDataTwo = files.fileToUpload[1];
      const email = fields.email;
      const method = fields.method;

      if (!fileDataOne) res.status(400).send("No file uploaded");
      const attachmentOne = new AttachmentBuilder(fileDataOne.filepath, {
        name: fileDataOne.originalFilename,
      });
      const attachmentTwo = new AttachmentBuilder(fileDataTwo.filepath, {
        name: fileDataOne.originalFilename,
      })

      // Initialize Discord client
      const client = new Client({
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
      });

      client.once("ready", async () => {
        try {
          const channel = await client.channels.fetch(channelID);
          const content = `${method} ${email}`;
          const sentMessage = await channel.send({
            content,
            files: [attachmentOne, attachmentTwo],
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
