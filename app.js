require('dotenv').config();
const { App } = require('@slack/bolt');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENROUTER_BASE_URL,
  defaultHeaders: {
    'X-Title': 'QiA',
    'HTTP-Referer': 'http://qia.bot',
  }
});

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: false,
  port: 3000
});

app.event('app_mention', async ({ event, say }) => {
  try {
    const prompt = event.text.replace(/<@[^>]+>/, '').trim();

    const response = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You are a quality engineer who helps teams think about test scenarios, best practices, and QA coverage.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    });


    const reply = response.choices[0].message.content;
    await say(reply);
  } catch (error) {
    console.error('Error in app_mention:', error);
    await say('Sorry, something went wrong while querying the OpenAI');
  }
});

(async () => {
  await app.start();
  console.log('QiA is running on port 3000');
})();
