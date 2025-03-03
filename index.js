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
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent  // Add this intent to ensure message content is accessible
  ]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  console.log(`Monitoring channel ID: ${TARGET_CHANNEL_ID}`);
  console.log(`Webhook URL: ${N8N_WEBHOOK_URL}`);
});

// Listen for new messages
client.on('messageCreate', async (message) => {
  try {
    // Extensive logging
    console.log('Received message:');
    console.log(`- Channel ID: ${message.channel.id}`);
    console.log(`- Target Channel ID: ${TARGET_CHANNEL_ID}`);
    console.log(`- Message Content: "${message.content}"`);
    console.log(`- Author: ${message.author.username}`);
    console.log(`- Is Bot: ${message.author.bot}`);

    // Ignore messages from bots and those outside the target channel
    if (message.author.bot || message.channel.id !== TARGET_CHANNEL_ID) {
      console.log('Message filtered out');
      return;
    }

    // Construct the payload with relevant message details
    const payload = {
      content: message.content,  // Ensure this is the actual message content
      author: {
        id: message.author.id,
        username: message.author.username,
        discriminator: message.author.discriminator || '0'
      },
      channel: {
        id: message.channel.id,
        name: message.channel.name
      },
      timestamp: message.createdTimestamp
    };

    console.log('Payload to be sent:', payload);

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
    console.error('Error in message handling:');
    console.error(`- Message: ${error.message}`);
    if (error.response) {
      console.error(`- Response data: ${JSON.stringify(error.response.data)}`);
      console.error(`- Response status: ${error.response.status}`);
    }
  }
});

// Log in to Discord with your bot token
client.login(DISCORD_TOKEN);