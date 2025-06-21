require('dotenv').config();
const { App } = require('@slack/bolt');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');


// Initialize OpenRouter via OpenAI SDK
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
  defaultHeaders: {
    'X-Title': 'QiA',
    'HTTP-Referer': 'http://qia.bot',
  }
});

// Initialize Slack bot
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: 3000
});

// Routing logic based on prompt prefix
function detectAgent(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.startsWith('scenario:')) return 'scenario-writer';
  return 'strategist';
}

async function processPrompt(rawPrompt) {
  const agent = detectAgent(rawPrompt);
  const systemPrompt = fs.readFileSync(path.join(__dirname, 'agents', `${agent}.md`), 'utf8');
  const userPrompt = rawPrompt.replace(/^\w+:\s*/, '').trim();

  console.info('[Agent Selected]:', agent);

  const response = await openai.chat.completions.create({
    model: process.env.OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  return response.choices[0].message.content;
}

// Handle @QiA mentions in channels
app.event('app_mention', async ({ event, say }) => {
  try {
    const rawPrompt = event.text.replace(/<@[^>]+>/, '').trim();
    const reply = await processPrompt(rawPrompt);
    await say(reply);
  } catch (error) {
    console.error('Error in @mention:', error);
    await say('Sorry, something went wrong while processing your message.');
  }
});

// Handle DMs
app.message(async ({ message, say }) => {
  try {
    // Just Inbox Messages
    if (message.channel_type !== 'im') return;

    const rawPrompt = message.text.trim();
    const reply = await processPrompt(rawPrompt);
    await say(reply);
  } catch (error) {
    console.error('Error in DM:', error);
    await say('Sorry, something went wrong while processing your direct message.');
  }
});

(async () => {
  await app.start();
  console.log('QiA is running on port 3000');
})();
