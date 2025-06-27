require('dotenv').config();
const { App } = require('@slack/bolt');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

const ERROR_MESSAGE = 'Sorry, something went wrong while processing your message.';

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

// Decide which agent is most appropriate
async function routeToAgent(userPrompt) {
  const routingPrompt = fs.readFileSync(path.join(__dirname, 'agents', 'router.md'), 'utf8');

  const response = await openai.chat.completions.create({
    model: process.env.OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: routingPrompt },
      { role: 'user', content: userPrompt }
    ]
  });

  const agent = response.choices[0].message.content.trim();

  if (agent === 'scenario-writer' || agent === 'strategist') {
    return agent;
  }

  console.warn('[Router Fallback] Unknown agent returned, using strategist.');
  return 'strategist';
}

async function processPrompt(userPrompt) {
  const agent = await routeToAgent(userPrompt);
  const systemPrompt = fs.readFileSync(path.join(__dirname, 'agents', `${agent}.md`), 'utf8');

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
    const userPrompt = event.text.replace(/<@[^>]+>/, '').trim();
    const reply = await processPrompt(userPrompt);
    await say({
      text: reply,
      thread_ts: event.thread_ts || event.ts
    });
  } catch (error) {
    console.error('Error in @mention:', error);
    await say({
      text: ERROR_MESSAGE,
      thread_ts: event.thread_ts || event.ts
    });
  }
});

// Handle DMs
app.message(async ({ message, say }) => {
  try {
    // Just Inbox Messages
    if (message.channel_type !== 'im') return;

    const userPrompt = message.text.trim();
    const reply = await processPrompt(userPrompt);
    await say({
      text: reply,
      thread_ts: message.thread_ts || message.ts
    });
  } catch (error) {
    console.error('Error in DM:', error);
    await say({
      text: ERROR_MESSAGE,
      thread_ts: message.thread_ts || message.ts
    });
  }
});

(async () => {
  await app.start();
  console.log('QiA is running on port 3000');
})();
