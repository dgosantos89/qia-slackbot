require('dotenv').config();
const { App } = require('@slack/bolt');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

// Routing logic based on prompt prefix
function detectAgent(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.startsWith('scenario:')) return 'scenario-writer';
  return 'strategist';
}

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

// Handle @QiA mentions
app.event('app_mention', async ({ event, say }) => {
  try {
    const rawPrompt = event.text.replace(/<@[^>]+>/, '').trim();
    const agent = detectAgent(rawPrompt);
    const systemPrompt = fs.readFileSync(path.join(__dirname, 'agents', `${agent}.md`), 'utf8');
    const userPrompt = rawPrompt.replace(/^\w+:\s*/, '').trim();

    console.info('Agent: ',agent);

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    const reply = response.choices[0].message.content;
    await say(reply);
  } catch (error) {
    console.error('Error in app_mention:', error);
    await say('Sorry, something went wrong while querying the agent.');
  }
});

(async () => {
  await app.start();
  console.log('QiA is running on port 3000');
})();
