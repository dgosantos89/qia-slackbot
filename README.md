# QiA - The Quality Insight Assistant Bot

QiA is a Slack bot designed to act as a dedicated Quality Assurance partner for development teams. By integrating with OpenAI-compatible APIs (like OpenRouter), it helps engineers and testers think critically about test scenarios, explore best practices, and improve overall QA coverage directly within their Slack workspace.

When you mention `@QiA` in a channel, it leverages a powerful language model to provide expert insights on quality engineering topics.

## Getting Started
Follow these instructions to get your own instance of the QiA bot up and running.

### Prerequisites
- Node.js (v16 or later recommended)
- A Slack Workspace with permissions to create and install apps.
- An API key from a service compatible with the OpenAI API, such as OpenRouter.ai.

1. Clone the Repository
First, clone this repository to your local machine:
```
git clone <your-repository-url>
cd <your-repository-name>
```

2. Install Dependencies
Install the necessary Node.js packages using npm:
```
npm install
```
3. Configure Environment Variables
The application's configuration is managed through environment variables. Create a file named .env in the root of your project and add the following variables.

```
# Slack API Credentials
# Go to your Slack App's "OAuth & Permissions" page for the Bot User OAuth Token
SLACK_BOT_TOKEN="xoxb-YourSlackBotToken"
# Go to your Slack App's "Basic Information" page for the Signing Secret
SLACK_SIGNING_SECRET="YourSlackSigningSecret"

# OpenAI / OpenRouter Configuration
# Your API key for the LLM provider
OPENROUTER_API_KEY="YourOpenRouterApiKey"
# The base URL for the API endpoint
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
# The specific model you want to use (e.g., "openai/gpt-4o")
OPENROUTER_MODEL="openai/gpt-4o"
```

How to get these values:

- Slack Credentials (SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET):
  - Create a new app on the Slack API website.
  - From the "Basic Information" page, find your Signing Secret.
  - Navigate to the "OAuth & Permissions" page and copy the Bot User OAuth Token. It will start with xoxb-.
  - Go to the "Event Subscriptions" page, enable events, and add app_mention to the "Subscribe to bot events" section. You will need to provide a public Request URL (e.g., using a service like ngrok to expose http://localhost:3000/slack/events during development).
  - Ensure your bot has the app_mentions:read and chat:write permissions under "OAuth & Permissions".
  - Install the app to your workspace.

- OpenRouter/OpenAI Credentials (OPENROUTER_API_KEY, etc.):
  - Sign up for an account at OpenRouter.ai or another compatible service.
  - Get your API Key from your account settings.
  - Choose a model to use and note its identifier for the OPENROUTER_MODEL variable.

4. Run the Application
Start the bot with the following command. The default port is 3000.
```
npm start
```
You should see a confirmation message in your console:
```
QiA is running on port 3000
```

## How to Use
Invite the bot to a public or private Slack channel.

Mention the bot by its handle (e.g., `@QiA`) followed by your question or prompt.

Example:
```
@QiA What are the most important test scenarios for a user login page?
```

The bot will process the prompt and reply with its analysis and suggestions in the same channel.