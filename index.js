// Load environment variables from a .env file
require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

// Retrieve necessary environment variables
const { DISCORD_TOKEN, TARGET_CHANNEL_ID, N8N_WEBHOOK_URL } = process.env;

if (!DISCORD_TOKEN || !TARGET_CHANNEL_ID || !N8N_WEBHOOK_URL) {
  console.error(
    "Error: One or more environment variables are missing. Please define DISCORD_TOKEN, TARGET_CHANNEL_ID, and N8N_WEBHOOK_URL."
  );
  process.exit(1);
}

// Create a new Discord client with the required intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Listen for new messages
client.on('messageCreate', async (message) => {
  try {
    // Ignore messages from bots and those outside the target channel
    if (message.author.bot || message.channel.id !== TARGET_CHANNEL_ID) return;

    // Construct the payload with relevant message details
    const payload = {
      content: message.content,
      author: {
        id: message.author.id,
        username: message.author.username,
        discriminator: message.author.discriminator
      },
      channel: {
        id: message.channel.id,
        name: message.channel.name
      },
      timestamp: message.createdTimestamp
    };

    // Send the payload to your n8n webhook endpoint
    const response = await axios.post(N8N_WEBHOOK_URL, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(
      `Message forwarded from ${message.author.tag}. Webhook responded with status ${response.status}.`
    );
  } catch (error) {
    console.error(`Error forwarding message: ${error.message}`);
  }
});

// Log in to Discord with your bot token
client.login(DISCORD_TOKEN);
